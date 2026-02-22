import { promises as fs } from "node:fs";
import path from "node:path";
import type { Catalog, CatalogKey, CatalogTarget, CatalogAddKeyRequest, CatalogRemoveKeyRequest } from "../domain/types";

const CATALOGS_DIR = "catalogs";

export async function loadCatalog(studioRoot: string, catalogName?: string): Promise<Catalog | null> {
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
  
  // Load by name
  const fileName = `${catalogName}.catalog.json`;
  const catalogPath = path.join(catalogsDir, fileName);
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

export async function saveCatalog(studioRoot: string, catalog: Catalog): Promise<void> {
  const catalogsDir = path.join(studioRoot, CATALOGS_DIR);
  const fileName = `${catalog.name}.catalog.json`;
  const catalogPath = path.join(catalogsDir, fileName);
  
  await fs.mkdir(catalogsDir, { recursive: true });
  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
}

export async function listCatalogs(studioRoot: string): Promise<string[]> {
  const catalogsDir = path.join(studioRoot, CATALOGS_DIR);
  try {
    const files = await fs.readdir(catalogsDir);
    return files
      .filter((file) => file.endsWith(".catalog.json"))
      .map((file) => file.replace(".catalog.json", ""));
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
  
  for (const name of catalogNames) {
    const catalog = await loadCatalog(studioRoot, name);
    if (catalog) {
      catalogs.set(name, catalog);
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
    keys: {
      colors: [],
      semanticTokens: [],
      textMateScopes: [],
    },
  };
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
  
  const newVersion = updateVersion
    ? incrementVersion(catalog.version)
    : catalog.version;
  
  const updatedCatalog = {
    ...catalog,
    version: newVersion,
    keys: mergedKeys,
  };
  
  // Save the updated catalog
  await saveCatalog(studioRoot, updatedCatalog);
  
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
