import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { catalogReferenceSchema, catalogSchema } from '../../model/schemas.js';
import type { Catalog, CatalogName, CatalogReference, Version } from '../../model/schemas.js';

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

  return {
    async saveCatalog(catalog: Catalog): Promise<void> {
      const parsed = catalogSchema.safeParse(catalog);
      if (!parsed.success) {
        throw new Error('Invalid catalog: ' + parsed.error.message);
      }
      await mkdir(dir, { recursive: true });
      const path = filePath(baseDir, catalog.name, catalog.version);
      await writeFile(path, JSON.stringify(parsed.data, null, 2), 'utf-8');
    },

    async loadCatalog(name: CatalogName, version: Version): Promise<Catalog | null> {
      const path = filePath(baseDir, name, version);
      try {
        const raw = await readFile(path, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        const result = catalogSchema.safeParse(parsed);
        if (result.success) {
          return result.data;
        }
        return null;
      } catch {
        return null;
      }
    },

    async deleteCatalog(name: CatalogName, version: Version): Promise<void> {
      const path = filePath(baseDir, name, version);
      try {
        await unlink(path);
      } catch {
        // file not found (no-op)
      }
    },

    async listCatalogs(): Promise<CatalogReference[]> {
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        const refs: CatalogReference[] = [];
        for (const ent of entries) {
          if (!ent.isFile()) continue;
          const parsed = parseFileName(ent.name);
          if (parsed) refs.push(parsed);
        }
        return refs;
      } catch {
        return [];
      }
    },
  };
}

export type CatalogRepository = ReturnType<typeof createCatalogRepository>;
