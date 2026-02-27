import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { catalogReferenceSchema, catalogSchema } from '../model/schemas.js';
import type { Catalog, CatalogName, CatalogReference, Version } from '../model/schemas.js';

const TAG = '[CatalogRepo]';
const CATALOGS_DIR = 'catalogs';

/** Semver at end of filename: optional prerelease and build. */
const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

function catalogsPath(baseDir: string): string {
  return join(baseDir, CATALOGS_DIR);
}

function fileName(name: CatalogName, version: Version): string {
  return `${name}-${version}.json`;
}

function filePath(baseDir: string, name: CatalogName, version: Version): string {
  return join(catalogsPath(baseDir), fileName(name, version));
}

/**
 * Parses a catalog filename (without path) into name and version, or null if not valid.
 * Expected format: `<catalogName>-<version>.json`
 */
function parseFileName(baseName: string): { name: CatalogName; version: Version } | null {
  if (!baseName.endsWith('.json')) return null;
  const withoutExt = baseName.slice(0, -'.json'.length);
  const match = FILENAME_VERSION_REGEX.exec(withoutExt);
  if (!match) return null;
  const [, name, version] = match;
  const refResult = catalogReferenceSchema.safeParse({ name, version });
  return refResult.success ? refResult.data : null;
}

/**
 * Creates a catalog repository that reads and writes catalogs under `baseDir/catalogs/`.
 * Each catalog is stored as a JSON file named `<catalogName>-<version>.json`.
 */
export function createCatalogRepository(baseDir: string) {
  const dir = catalogsPath(baseDir);
  console.debug(TAG, 'initialized with dir:', dir);

  return {
    async saveCatalog(catalog: Catalog): Promise<void> {
      console.debug(TAG, 'saveCatalog', catalog.name, `v${catalog.version}`, `(${catalog.tokens.length} tokens)`);
      const parsed = catalogSchema.safeParse(catalog);
      if (!parsed.success) {
        console.error(TAG, 'saveCatalog validation failed:', parsed.error.message);
        throw new Error('Invalid catalog: ' + parsed.error.message);
      }
      await mkdir(dir, { recursive: true });
      const path = filePath(baseDir, catalog.name, catalog.version);
      await writeFile(path, JSON.stringify(parsed.data, null, 2), 'utf-8');
      console.debug(TAG, 'saveCatalog written to', path);
    },

    async loadCatalog(name: CatalogName, version: Version): Promise<Catalog | null> {
      const path = filePath(baseDir, name, version);
      console.debug(TAG, 'loadCatalog', name, `v${version}`, 'from', path);
      try {
        const raw = await readFile(path, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        const result = catalogSchema.safeParse(parsed);
        if (result.success) {
          console.debug(TAG, 'loadCatalog →', result.data.tokens.length, 'token(s)');
          return result.data;
        }
        console.warn(TAG, 'loadCatalog validation failed for', path);
        return null;
      } catch {
        console.debug(TAG, 'loadCatalog file not found or unreadable:', path);
        return null;
      }
    },

    async deleteCatalog(name: CatalogName, version: Version): Promise<void> {
      const path = filePath(baseDir, name, version);
      console.debug(TAG, 'deleteCatalog', name, `v${version}`, path);
      try {
        await unlink(path);
        console.debug(TAG, 'deleteCatalog removed', path);
      } catch {
        console.debug(TAG, 'deleteCatalog file not found (no-op):', path);
      }
    },

    async listCatalogs(): Promise<CatalogReference[]> {
      console.debug(TAG, 'listCatalogs scanning', dir);
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        const refs: CatalogReference[] = [];
        for (const ent of entries) {
          if (!ent.isFile()) continue;
          const parsed = parseFileName(ent.name);
          if (parsed) refs.push(parsed);
        }
        console.debug(TAG, 'listCatalogs →', refs.length, 'ref(s)');
        return refs;
      } catch {
        console.debug(TAG, 'listCatalogs directory does not exist yet, returning empty');
        return [];
      }
    },
  };
}

export type CatalogRepository = ReturnType<typeof createCatalogRepository>;
