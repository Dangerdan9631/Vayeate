import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  CatalogPin,
  CatalogSnapshot,
  CatalogSyncResult,
  CatalogValidationIssue,
  CatalogValidationReport,
} from "../domain/types";
import { stableStringify } from "./json";

const CATALOG_DIR = "catalog";
const PIN_FILE = "pin.json";
const SNAPSHOT_FILE = "snapshot.json";
const REPORT_FILE = "report.json";

const DEFAULT_PIN: CatalogPin = {
  schemaVersion: 1,
  pinnedVersion: "vscode-catalog-2026-02-21",
  updatePolicy: "manual",
  sources: {
    themeColorRegistryUrl: "https://code.visualstudio.com/api/references/theme-color",
    semanticTokenRegistryUrl:
      "https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#standard-token-types-and-modifiers",
    scopeGuidanceUrl: "https://macromates.com/manual/en/scope_selectors",
  },
};

interface ParsedThemeLike {
  colors?: Record<string, string>;
  semanticTokenColors?: Record<string, string | Record<string, unknown>>;
  tokenColors?: Array<{ scope?: string | string[] }>;
}

function stripJsoncComments(source: string): string {
  let output = "";
  let index = 0;

  while (index < source.length) {
    if (source[index] === '"') {
      let cursor = index + 1;
      while (cursor < source.length) {
        if (source[cursor] === "\\") {
          cursor += 2;
          continue;
        }
        if (source[cursor] === '"') {
          cursor += 1;
          break;
        }
        cursor += 1;
      }
      output += source.slice(index, cursor);
      index = cursor;
      continue;
    }

    if (source[index] === "/" && source[index + 1] === "/") {
      while (index < source.length && source[index] !== "\n") {
        index += 1;
      }
      continue;
    }

    if (source[index] === "/" && source[index + 1] === "*") {
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) {
        index += 1;
      }
      index += 2;
      continue;
    }

    output += source[index];
    index += 1;
  }

  return output;
}

function parseJsonc<T>(source: string): T {
  return JSON.parse(stripJsoncComments(source).replace(/,(\s*[}\]])/g, "$1")) as T;
}

async function ensureCatalogDirectory(projectRoot: string): Promise<string> {
  const target = path.resolve(projectRoot, CATALOG_DIR);
  await fs.mkdir(target, { recursive: true });
  return target;
}

async function readJsonIfExists<T>(targetPath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(targetPath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return null;
    }
    throw error;
  }
}

async function writeJsonAtomic(targetPath: string, value: unknown): Promise<void> {
  const tempPath = `${targetPath}.tmp`;
  await fs.writeFile(tempPath, stableStringify(value), "utf8");
  await fs.rename(tempPath, targetPath);
}

export async function loadCatalogPin(projectRoot: string): Promise<CatalogPin> {
  const catalogDir = await ensureCatalogDirectory(projectRoot);
  const pinPath = path.join(catalogDir, PIN_FILE);
  const existing = await readJsonIfExists<CatalogPin>(pinPath);
  if (existing) {
    return existing;
  }

  await writeJsonAtomic(pinPath, DEFAULT_PIN);
  return DEFAULT_PIN;
}

function collectScopes(scope: string | string[] | undefined, target: Set<string>): void {
  if (!scope) return;
  const list = Array.isArray(scope) ? scope : [scope];
  for (const entry of list) {
    const trimmed = entry.trim();
    if (trimmed) {
      target.add(trimmed);
    }
  }
}

async function buildSnapshotFromThemes(projectRoot: string, pinnedVersion: string): Promise<CatalogSnapshot> {
  const themesDir = path.resolve(projectRoot, "../themes");
  const files = (await fs.readdir(themesDir)).filter((file) => file.endsWith(".json")).sort();

  const colorKeys = new Set<string>();
  const semanticKeys = new Set<string>();
  const scopes = new Set<string>();

  for (const fileName of files) {
    const fullPath = path.join(themesDir, fileName);
    const raw = await fs.readFile(fullPath, "utf8");
    const parsed = parseJsonc<ParsedThemeLike>(raw);

    for (const key of Object.keys(parsed.colors ?? {})) {
      colorKeys.add(key);
    }
    for (const key of Object.keys(parsed.semanticTokenColors ?? {})) {
      semanticKeys.add(key);
    }

    for (const entry of parsed.tokenColors ?? []) {
      collectScopes(entry.scope, scopes);
    }
  }

  return {
    schemaVersion: 1,
    pinnedVersion,
    generatedAt: new Date().toISOString(),
    colorKeys: Array.from(colorKeys).sort(),
    semanticTokenKeys: Array.from(semanticKeys).sort(),
    textMateScopes: Array.from(scopes).sort(),
  };
}

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

export function validateCatalogSnapshot(snapshot: CatalogSnapshot): CatalogValidationReport {
  const issues: CatalogValidationIssue[] = [];

  if (!snapshot.colorKeys.includes("editor.background")) {
    issues.push({
      code: "MISSING_EDITOR_BACKGROUND",
      severity: "error",
      message: "Snapshot does not include required color key editor.background.",
    });
  }

  if (!snapshot.colorKeys.includes("editor.foreground")) {
    issues.push({
      code: "MISSING_EDITOR_FOREGROUND",
      severity: "error",
      message: "Snapshot does not include required color key editor.foreground.",
    });
  }

  if (snapshot.semanticTokenKeys.length === 0) {
    issues.push({
      code: "NO_SEMANTIC_TOKENS",
      severity: "warning",
      message: "Snapshot has no semantic token keys.",
    });
  }

  if (hasDuplicates(snapshot.colorKeys) || hasDuplicates(snapshot.semanticTokenKeys) || hasDuplicates(snapshot.textMateScopes)) {
    issues.push({
      code: "DUPLICATE_ENTRIES",
      severity: "error",
      message: "Snapshot contains duplicate entries.",
    });
  }

  const invalidColorKeys = snapshot.colorKeys.filter((key) => /\s/.test(key));
  if (invalidColorKeys.length > 0) {
    issues.push({
      code: "INVALID_COLOR_KEY_FORMAT",
      severity: "error",
      message: `Color keys include whitespace: ${invalidColorKeys.slice(0, 5).join(", ")}`,
    });
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
    stats: {
      colorKeyCount: snapshot.colorKeys.length,
      semanticTokenKeyCount: snapshot.semanticTokenKeys.length,
      textMateScopeCount: snapshot.textMateScopes.length,
    },
  };
}

export async function syncCatalogSnapshot(projectRoot: string): Promise<CatalogSyncResult> {
  const pin = await loadCatalogPin(projectRoot);
  const snapshot = await buildSnapshotFromThemes(projectRoot, pin.pinnedVersion);
  const report = validateCatalogSnapshot(snapshot);

  const catalogDir = await ensureCatalogDirectory(projectRoot);
  await writeJsonAtomic(path.join(catalogDir, SNAPSHOT_FILE), snapshot);
  await writeJsonAtomic(path.join(catalogDir, REPORT_FILE), report);

  return { snapshot, report };
}

export async function getCatalogStatus(projectRoot: string): Promise<{
  pin: CatalogPin;
  snapshot: CatalogSnapshot | null;
  report: CatalogValidationReport | null;
}> {
  const pin = await loadCatalogPin(projectRoot);
  const catalogDir = await ensureCatalogDirectory(projectRoot);
  const [snapshot, report] = await Promise.all([
    readJsonIfExists<CatalogSnapshot>(path.join(catalogDir, SNAPSHOT_FILE)),
    readJsonIfExists<CatalogValidationReport>(path.join(catalogDir, REPORT_FILE)),
  ]);

  return { pin, snapshot, report };
}