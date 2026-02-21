import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  CatalogPin,
  CatalogRemoteSnapshot,
  CatalogSnapshot,
  CatalogSyncResult,
  CatalogValidationIssue,
  CatalogValidationReport,
} from "../domain/types";
import { stableStringify } from "./json";

const CATALOG_DIR = "catalog";
const PIN_FILE = "pin.json";
const SNAPSHOT_FILE = "snapshot.json";
const REMOTE_SNAPSHOT_FILE = "remote-snapshot.json";
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
    source: "local",
    colorKeys: Array.from(colorKeys).sort(),
    semanticTokenKeys: Array.from(semanticKeys).sort(),
    textMateScopes: Array.from(scopes).sort(),
  };
}

function normalizeKey(value: string): string {
  return value.trim();
}

function matchesColorKey(value: string): boolean {
  if (value.length < 3 || value.length > 120) return false;
  if (!value.includes(".")) return false;
  if (/\s/.test(value)) return false;
  if (!/^[a-zA-Z0-9.-]+$/.test(value)) return false;
  return true;
}

function matchesScope(value: string): boolean {
  if (value.length < 3 || value.length > 160) return false;
  if (/\s/.test(value)) return false;
  if (!value.includes(".")) return false;
  if (!/^[a-zA-Z0-9._*-]+$/.test(value)) return false;
  return true;
}

function extractBacktickValues(source: string): string[] {
  const values: string[] = [];
  for (const match of source.matchAll(/`([^`]+)`/g)) {
    values.push(match[1]);
  }
  return values;
}

function uniqueSorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort();
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "vayeate-theme-studio/0.1",
      accept: "text/html, text/plain, application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

function normalizeRemoteThemeColorKeys(raw: string): string[] {
  const candidates = extractBacktickValues(raw).map(normalizeKey);
  const keys = candidates.filter(matchesColorKey);
  return uniqueSorted(keys);
}

function normalizeRemoteSemanticTokenKeys(raw: string): string[] {
  const fromBackticks = extractBacktickValues(raw).map(normalizeKey);
  const semantic = fromBackticks.filter((value) => /^[a-z][a-zA-Z]*(\.[a-zA-Z]+)?$/.test(value));
  return uniqueSorted(semantic);
}

function normalizeRemoteScopes(raw: string): string[] {
  const fromBackticks = extractBacktickValues(raw).map(normalizeKey);
  const scopes = fromBackticks.filter(matchesScope);
  return uniqueSorted(scopes);
}

async function fetchRemoteSnapshot(pin: CatalogPin): Promise<CatalogRemoteSnapshot> {
  const [themeColorHtml, semanticHtml, scopeHtml] = await Promise.all([
    fetchText(pin.sources.themeColorRegistryUrl),
    fetchText(pin.sources.semanticTokenRegistryUrl),
    fetchText(pin.sources.scopeGuidanceUrl),
  ]);

  return {
    schemaVersion: 1,
    pinnedVersion: pin.pinnedVersion,
    fetchedAt: new Date().toISOString(),
    sourceUrls: pin.sources,
    colorKeys: normalizeRemoteThemeColorKeys(themeColorHtml),
    semanticTokenKeys: normalizeRemoteSemanticTokenKeys(semanticHtml),
    textMateScopes: normalizeRemoteScopes(scopeHtml),
  };
}

function mergeLocalAndRemote(local: CatalogSnapshot, remote: CatalogRemoteSnapshot): CatalogSnapshot {
  return {
    schemaVersion: 1,
    pinnedVersion: local.pinnedVersion,
    generatedAt: new Date().toISOString(),
    source: "merged",
    colorKeys: uniqueSorted([...local.colorKeys, ...remote.colorKeys]),
    semanticTokenKeys: uniqueSorted([...local.semanticTokenKeys, ...remote.semanticTokenKeys]),
    textMateScopes: uniqueSorted([...local.textMateScopes, ...remote.textMateScopes]),
  };
}

function listDiff(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

function applyDriftIssues(
  issues: CatalogValidationIssue[],
  local: CatalogSnapshot,
  remote: CatalogRemoteSnapshot | null,
): {
  localOnlyColorKeys: number;
  localOnlySemanticTokenKeys: number;
  localOnlyTextMateScopes: number;
  remoteOnlyColorKeys: number;
  remoteOnlySemanticTokenKeys: number;
  remoteOnlyTextMateScopes: number;
} {
  if (!remote) {
    issues.push({
      code: "REMOTE_SNAPSHOT_MISSING",
      severity: "warning",
      message: "Remote catalog snapshot is unavailable; using local-only snapshot.",
    });
    return {
      localOnlyColorKeys: local.colorKeys.length,
      localOnlySemanticTokenKeys: local.semanticTokenKeys.length,
      localOnlyTextMateScopes: local.textMateScopes.length,
      remoteOnlyColorKeys: 0,
      remoteOnlySemanticTokenKeys: 0,
      remoteOnlyTextMateScopes: 0,
    };
  }

  const localOnlyColorKeys = listDiff(local.colorKeys, remote.colorKeys);
  const localOnlySemantic = listDiff(local.semanticTokenKeys, remote.semanticTokenKeys);
  const localOnlyScopes = listDiff(local.textMateScopes, remote.textMateScopes);

  const remoteOnlyColorKeys = listDiff(remote.colorKeys, local.colorKeys);
  const remoteOnlySemantic = listDiff(remote.semanticTokenKeys, local.semanticTokenKeys);
  const remoteOnlyScopes = listDiff(remote.textMateScopes, local.textMateScopes);

  if (remoteOnlyColorKeys.length > 0 || remoteOnlySemantic.length > 0 || remoteOnlyScopes.length > 0) {
    issues.push({
      code: "REMOTE_DRIFT_DETECTED",
      severity: "warning",
      message: `Remote-only entries detected (colors=${remoteOnlyColorKeys.length}, semantic=${remoteOnlySemantic.length}, scopes=${remoteOnlyScopes.length}).`,
    });
  }

  if (localOnlyColorKeys.length > 0 || localOnlySemantic.length > 0 || localOnlyScopes.length > 0) {
    issues.push({
      code: "LOCAL_EXTENSIONS_PRESENT",
      severity: "warning",
      message: `Local-only entries detected (colors=${localOnlyColorKeys.length}, semantic=${localOnlySemantic.length}, scopes=${localOnlyScopes.length}).`,
    });
  }

  return {
    localOnlyColorKeys: localOnlyColorKeys.length,
    localOnlySemanticTokenKeys: localOnlySemantic.length,
    localOnlyTextMateScopes: localOnlyScopes.length,
    remoteOnlyColorKeys: remoteOnlyColorKeys.length,
    remoteOnlySemanticTokenKeys: remoteOnlySemantic.length,
    remoteOnlyTextMateScopes: remoteOnlyScopes.length,
  };
}

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

export function validateCatalogSnapshot(
  snapshot: CatalogSnapshot,
  context?: { localSnapshot?: CatalogSnapshot; remoteSnapshot?: CatalogRemoteSnapshot | null },
): CatalogValidationReport {
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

  const localSnapshot = context?.localSnapshot ?? snapshot;
  const remoteSnapshot = context?.remoteSnapshot ?? null;
  const driftStats = applyDriftIssues(issues, localSnapshot, remoteSnapshot);

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
    stats: {
      colorKeyCount: snapshot.colorKeys.length,
      semanticTokenKeyCount: snapshot.semanticTokenKeys.length,
      textMateScopeCount: snapshot.textMateScopes.length,
      remoteColorKeyCount: remoteSnapshot?.colorKeys.length ?? 0,
      remoteSemanticTokenKeyCount: remoteSnapshot?.semanticTokenKeys.length ?? 0,
      remoteTextMateScopeCount: remoteSnapshot?.textMateScopes.length ?? 0,
      ...driftStats,
    },
  };
}

export async function syncCatalogSnapshot(projectRoot: string): Promise<CatalogSyncResult> {
  const pin = await loadCatalogPin(projectRoot);
  const localSnapshot = await buildSnapshotFromThemes(projectRoot, pin.pinnedVersion);

  let remoteSnapshot: CatalogRemoteSnapshot | null = null;
  try {
    remoteSnapshot = await fetchRemoteSnapshot(pin);
  } catch {
    remoteSnapshot = null;
  }

  const snapshot = remoteSnapshot ? mergeLocalAndRemote(localSnapshot, remoteSnapshot) : localSnapshot;
  const report = validateCatalogSnapshot(snapshot, {
    localSnapshot,
    remoteSnapshot,
  });

  const catalogDir = await ensureCatalogDirectory(projectRoot);
  await writeJsonAtomic(path.join(catalogDir, SNAPSHOT_FILE), snapshot);
  if (remoteSnapshot) {
    await writeJsonAtomic(path.join(catalogDir, REMOTE_SNAPSHOT_FILE), remoteSnapshot);
  }
  await writeJsonAtomic(path.join(catalogDir, REPORT_FILE), report);

  return { snapshot, remoteSnapshot, report };
}

export async function getCatalogStatus(projectRoot: string): Promise<{
  pin: CatalogPin;
  snapshot: CatalogSnapshot | null;
  remoteSnapshot: CatalogRemoteSnapshot | null;
  report: CatalogValidationReport | null;
}> {
  const pin = await loadCatalogPin(projectRoot);
  const catalogDir = await ensureCatalogDirectory(projectRoot);
  const [snapshot, remoteSnapshot, report] = await Promise.all([
    readJsonIfExists<CatalogSnapshot>(path.join(catalogDir, SNAPSHOT_FILE)),
    readJsonIfExists<CatalogRemoteSnapshot>(path.join(catalogDir, REMOTE_SNAPSHOT_FILE)),
    readJsonIfExists<CatalogValidationReport>(path.join(catalogDir, REPORT_FILE)),
  ]);

  return { pin, snapshot, remoteSnapshot, report };
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateCatalogPin(pin: CatalogPin): void {
  if (pin.schemaVersion !== 1) {
    throw new Error("Catalog pin schemaVersion must be 1.");
  }

  if (!pin.pinnedVersion || pin.pinnedVersion.trim().length < 3) {
    throw new Error("Catalog pin pinnedVersion is required.");
  }

  if (pin.updatePolicy !== "manual" && pin.updatePolicy !== "scheduled") {
    throw new Error("Catalog pin updatePolicy must be manual or scheduled.");
  }

  if (!isHttpUrl(pin.sources.themeColorRegistryUrl)) {
    throw new Error("Catalog pin themeColorRegistryUrl must be a valid http/https URL.");
  }
  if (!isHttpUrl(pin.sources.semanticTokenRegistryUrl)) {
    throw new Error("Catalog pin semanticTokenRegistryUrl must be a valid http/https URL.");
  }
  if (!isHttpUrl(pin.sources.scopeGuidanceUrl)) {
    throw new Error("Catalog pin scopeGuidanceUrl must be a valid http/https URL.");
  }
}

export async function saveCatalogPin(projectRoot: string, pin: CatalogPin): Promise<CatalogPin> {
  validateCatalogPin(pin);
  const catalogDir = await ensureCatalogDirectory(projectRoot);
  const pinPath = path.join(catalogDir, PIN_FILE);
  await writeJsonAtomic(pinPath, pin);
  return pin;
}