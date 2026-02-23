import { promises as fs } from "node:fs";
import path from "node:path";
import type { Catalog, CatalogTarget, CatalogAddKeyRequest, CatalogRemoveKeyRequest } from "../domain/types";

const CATALOGS_DIR = "catalogs";

function toCatalogRef(catalog: Pick<Catalog, "name" | "version">): string {
  return `${catalog.name}@${catalog.version}`;
}

function compareSemverDesc(left: string, right: string): number {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10) || 0);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] > rightParts[index]) {
      return -1;
    }
    if (leftParts[index] < rightParts[index]) {
      return 1;
    }
  }

  return 0;
}

function compareCatalogAsc(left: Catalog, right: Catalog): number {
  const nameCompare = left.name.localeCompare(right.name);
  if (nameCompare !== 0) {
    return nameCompare;
  }

  return compareSemverDesc(left.version, right.version);
}

function getVersionedCatalogFileName(catalogName: string, version: string): string {
  return `${catalogName}.v${version}.catalog.json`;
}

function areSortedArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function haveCatalogKeysChanged(previous: Catalog, next: Catalog): boolean {
  return (
    !areSortedArraysEqual(previous.keys.colors, next.keys.colors) ||
    !areSortedArraysEqual(previous.keys.semanticTokens, next.keys.semanticTokens) ||
    !areSortedArraysEqual(previous.keys.textMateScopes, next.keys.textMateScopes)
  );
}

export async function loadCatalog(studioRoot: string, catalogName?: string, version?: string): Promise<Catalog | null> {
  const catalogsDir = path.join(studioRoot, CATALOGS_DIR);
  
  // If no name specified, try to load default catalog
  if (!catalogName) {
    const catalogPath = path.join(studioRoot, "catalog", "catalog.json");
    try {
      const content = await fs.readFile(catalogPath, "utf8");
      return JSON.parse(content) as Catalog;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("ENOENT")) {
        return null;
      }
      throw error;
    }
  }
  
  // Load by explicit name+version first
  const fileName = version
    ? getVersionedCatalogFileName(catalogName, version)
    : `${catalogName}.catalog.json`;
  const catalogPath = path.join(catalogsDir, fileName);
  try {
    const content = await fs.readFile(catalogPath, "utf8");
    return JSON.parse(content) as Catalog;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      const catalogs = await listCatalogs(studioRoot);
      const byName = catalogs
        .filter((catalog) => catalog.name === catalogName)
        .sort(compareCatalogAsc);
      const byVersion = version
        ? byName.find((catalog) => catalog.version === version)
        : byName[0];
      if (byVersion) {
        return byVersion;
      }

      return null;
    }
    throw error;
  }
}

export async function saveCatalog(studioRoot: string, catalog: Catalog): Promise<void> {
  const catalogsDir = path.join(studioRoot, CATALOGS_DIR);
  const fileName = getVersionedCatalogFileName(catalog.name, catalog.version);
  const catalogPath = path.join(catalogsDir, fileName);
  
  await fs.mkdir(catalogsDir, { recursive: true });
  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
}

export async function listCatalogs(studioRoot: string): Promise<Catalog[]> {
  const catalogsDir = path.join(studioRoot, CATALOGS_DIR);
  try {
    const files = await fs.readdir(catalogsDir);
    const catalogFiles = files.filter((file) => file.endsWith(".catalog.json"));
    const allCatalogs = await Promise.all(
      catalogFiles.map(async (file) => {
        const catalogPath = path.join(catalogsDir, file);
        const content = await fs.readFile(catalogPath, "utf8");
        return JSON.parse(content) as Catalog;
      })
    );

    const deduped = new Map<string, Catalog>();
    for (const catalog of allCatalogs) {
      const key = toCatalogRef(catalog);
      if (!deduped.has(key)) {
        deduped.set(key, catalog);
      }
    }

    return Array.from(deduped.values()).sort(compareCatalogAsc);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ENOENT")) {
      return [];
    }
    throw error;
  }
}

export async function loadCatalogsByName(studioRoot: string, catalogNames: string[]): Promise<Map<string, Catalog>> {
  const catalogs = new Map<string, Catalog>();
  
  for (const catalogRef of catalogNames) {
    const separatorIndex = catalogRef.lastIndexOf("@");
    const hasVersion = separatorIndex > 0 && separatorIndex < catalogRef.length - 1;
    const catalogName = hasVersion ? catalogRef.slice(0, separatorIndex) : catalogRef;
    const version = hasVersion ? catalogRef.slice(separatorIndex + 1) : undefined;
    const catalog = await loadCatalog(studioRoot, catalogName, version);
    if (catalog) {
      catalogs.set(catalog.name, catalog);
    }
  }
  
  return catalogs;
}

export async function createDefaultCatalog(): Promise<Catalog> {
  return {
    schemaVersion: 2,
    name: "Default Catalog",
    version: "1.0.0",
    source: "manual",
    locked: false,
    keys: {
      colors: [],
      semanticTokens: [],
      textMateScopes: [],
    },
  };
}

export function withManualLock(catalog: Catalog): Catalog {
  if (catalog.source !== "manual") {
    throw new Error("Only manual catalogs can be locked");
  }

  if (catalog.locked) {
    return catalog;
  }

  return {
    ...catalog,
    locked: true,
  };
}

export function applyManualLockedVersioning(previous: Catalog | null, next: Catalog): Catalog {
  if (!previous || previous.source !== "manual") {
    return next;
  }

  if (!previous.locked) {
    return {
      ...next,
      locked: next.locked ?? false,
    };
  }

  const keysChanged = haveCatalogKeysChanged(previous, next);
  if (!keysChanged) {
    return {
      ...next,
      locked: true,
      version: previous.version,
    };
  }

  return {
    ...next,
    version: incrementVersion(previous.version),
    locked: false,
  };
}

export async function deleteCatalogVersion(studioRoot: string, catalogName: string, version: string): Promise<boolean> {
  const catalogsDir = path.join(studioRoot, CATALOGS_DIR);
  const versionedPath = path.join(catalogsDir, getVersionedCatalogFileName(catalogName, version));

  try {
    await fs.unlink(versionedPath);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("ENOENT")) {
      throw error;
    }
  }

  const catalogs = await listCatalogs(studioRoot);
  const match = catalogs.find((catalog) => catalog.name === catalogName && catalog.version === version);
  if (!match) {
    return false;
  }

  const files = await fs.readdir(catalogsDir);
  for (const file of files) {
    const fullPath = path.join(catalogsDir, file);
    try {
      const content = await fs.readFile(fullPath, "utf8");
      const parsed = JSON.parse(content) as Catalog;
      if (parsed.name === catalogName && parsed.version === version) {
        await fs.unlink(fullPath);
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

export function addCatalogKey(catalog: Catalog, request: CatalogAddKeyRequest): Catalog {
  if (catalog.source === "remote") {
    throw new Error("Cannot add keys to remote catalog");
  }
  
  const targetArray = catalog.keys[request.target];
  const exists = targetArray.includes(request.key);
  
  if (exists) {
    return catalog;
  }
  
  return {
    ...catalog,
    keys: {
      ...catalog.keys,
      [request.target]: [...targetArray, request.key],
    },
  };
}

export function removeCatalogKey(catalog: Catalog, request: CatalogRemoveKeyRequest): Catalog {
  if (catalog.source === "remote") {
    throw new Error("Cannot remove keys from remote catalog");
  }
  
  return {
    ...catalog,
    keys: {
      ...catalog.keys,
      [request.target]: catalog.keys[request.target].filter((key) => key !== request.key),
    },
  };
}

export async function syncCatalogFromRemote(
  studioRoot: string,
  catalog: Catalog,
  updateVersion: boolean
): Promise<Catalog> {
  if (catalog.source === "manual") {
    throw new Error("Cannot sync manual catalog from remote");
  }
  
  if (!catalog.sources) {
    throw new Error("Remote catalog has no source URLs configured");
  }
  
  // Fetch remote keys from the configured sources
  const fetchedKeys = await fetchRemoteKeys(catalog.sources);
  
  // Merge with existing keys (remote sources are authoritative, but we keep local additions)
  const mergedKeys = {
    colors: uniqueSorted([...catalog.keys.colors, ...fetchedKeys.colors]),
    semanticTokens: uniqueSorted([...catalog.keys.semanticTokens, ...fetchedKeys.semanticTokens]),
    textMateScopes: uniqueSorted([...catalog.keys.textMateScopes, ...fetchedKeys.textMateScopes]),
  };

  const hasChanged =
    !areSortedArraysEqual(catalog.keys.colors, mergedKeys.colors) ||
    !areSortedArraysEqual(catalog.keys.semanticTokens, mergedKeys.semanticTokens) ||
    !areSortedArraysEqual(catalog.keys.textMateScopes, mergedKeys.textMateScopes);

  const newVersion = hasChanged
    ? incrementVersion(catalog.version)
    : catalog.version;
  
  const updatedCatalog = {
    ...catalog,
    version: newVersion,
    keys: mergedKeys,
  };
  
  // Save only when changed; unchanged keeps current version file as-is
  if (hasChanged || updateVersion) {
    await saveCatalog(studioRoot, updatedCatalog);
  }
  
  return updatedCatalog;
}

async function fetchRemoteKeys(sources: {
  themeColorRegistryUrl?: string;
  semanticTokenRegistryUrl?: string;
  scopeGuidanceUrl?: string;
}): Promise<{
  colors: string[];
  semanticTokens: string[];
  textMateScopes: string[];
}> {
  const results = {
    colors: [] as string[],
    semanticTokens: [] as string[],
    textMateScopes: [] as string[],
  };
  
  // Fetch colors if URL is provided
  if (sources.themeColorRegistryUrl) {
    try {
      const html = await fetchText(sources.themeColorRegistryUrl);
      results.colors = normalizeRemoteThemeColorKeys(html);
    } catch (error) {
      console.warn("Failed to fetch theme colors:", error);
    }
  }
  
  // Fetch semantic tokens if URL is provided
  if (sources.semanticTokenRegistryUrl) {
    try {
      const html = await fetchText(sources.semanticTokenRegistryUrl);
      results.semanticTokens = normalizeRemoteSemanticTokenKeys(html);
    } catch (error) {
      console.warn("Failed to fetch semantic tokens:", error);
    }
  }
  
  // Fetch TextMate scopes if URL is provided
  if (sources.scopeGuidanceUrl) {
    try {
      const html = await fetchText(sources.scopeGuidanceUrl);
      results.textMateScopes = normalizeRemoteScopes(html);
    } catch (error) {
      console.warn("Failed to fetch TextMate scopes:", error);
    }
  }
  
  return results;
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

function extractBacktickValues(raw: string): string[] {
  const pattern = /`([^`]+)`/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(raw)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

function extractCodeTagValues(raw: string): string[] {
  const pattern = /<code[^>]*>([\s\S]*?)<\/code>/gi;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(raw)) !== null) {
    const inner = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
    if (inner) {
      matches.push(inner);
    }
  }

  return matches;
}

function extractCodeLikeValues(raw: string): string[] {
  return [...extractBacktickValues(raw), ...extractCodeTagValues(raw)];
}

function normalizeKey(key: string): string {
  return key.trim();
}

function matchesColorKey(candidate: string): boolean {
  return /^[a-z][a-zA-Z.]*$/.test(candidate) && candidate.includes(".");
}

function matchesScope(candidate: string): boolean {
  return /^[a-z][a-zA-Z.]*$/.test(candidate) && candidate.includes(".");
}

function normalizeRemoteThemeColorKeys(raw: string): string[] {
  const candidates = extractCodeLikeValues(raw).map(normalizeKey);
  const keys = candidates.filter(matchesColorKey);
  return uniqueSorted(keys);
}

function normalizeRemoteSemanticTokenKeys(raw: string): string[] {
  const candidates = extractCodeLikeValues(raw).map(normalizeKey);
  const semantic = candidates.filter((value) => /^[a-z][a-zA-Z]*(\.[a-zA-Z]+)?$/.test(value));
  return uniqueSorted(semantic);
}

function normalizeRemoteScopes(raw: string): string[] {
  const candidates = extractCodeLikeValues(raw).map(normalizeKey);
  const scopes = candidates.filter(matchesScope);
  return uniqueSorted(scopes);
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function incrementVersion(version: string): string {
  const parts = version.split(".");
  const patch = parseInt(parts[2] || "0", 10);
  return `${parts[0]}.${parts[1]}.${patch + 1}`;
}

export function getCatalogKeys(catalog: Catalog, target: CatalogTarget): string[] {
  return catalog.keys[target];
}

export function isRemoteCatalog(catalog: Catalog): boolean {
  return catalog.source === "remote";
}

export function isManualCatalog(catalog: Catalog): boolean {
  return catalog.source === "manual";
}
