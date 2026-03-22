import { singleton } from 'tsyringe';
import { createCatalogWithParams } from '../../model/factories';
import { catalogReferenceSchema, catalogSchema } from '../../model/schemas';
import type { Catalog, CatalogName, CatalogReference, Version } from '../../model/schemas';
import { FileSystemService } from '../services/file-system-service';

/** Package-relative path: Theme Studio root `data/catalogs/`. */
const CATALOGS_RELATIVE_DIR = 'data/catalogs';

/** Semver at end of filename: optional prerelease and build. */
const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

function fileName(name: CatalogName, version: Version): string {
  return `${name}-${version}.json`;
}

function catalogRelativeFilePath(name: CatalogName, version: Version): string {
  return `${CATALOGS_RELATIVE_DIR}/${fileName(name, version)}`;
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

@singleton()
export class CatalogGateway {
  constructor(private readonly fileSystemService: FileSystemService) {}

  async createCatalog(params: { name: string; type: 'manual' | 'remote' }): Promise<Catalog> {
    const catalog = createCatalogWithParams(params);
    await this.saveCatalog(catalog);
    return catalog;
  }

  async saveCatalog(catalog: Catalog): Promise<void> {
    const parsed = catalogSchema.safeParse(catalog);
    if (!parsed.success) {
      throw new Error('Invalid catalog: ' + parsed.error.message);
    }
    const rel = catalogRelativeFilePath(catalog.name, catalog.version);
    await this.fileSystemService.saveFile(rel, JSON.stringify(parsed.data, null, 2));
  }

  async loadCatalog(name: string, version: string): Promise<Catalog | null> {
    const rel = catalogRelativeFilePath(name, version);
    try {
      const raw = await this.fileSystemService.loadFile(rel);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      const result = catalogSchema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  async deleteCatalog(name: string, version: string): Promise<void> {
    const rel = catalogRelativeFilePath(name, version);
    try {
      await this.fileSystemService.deleteFile(rel);
    } catch {
      // file not found (no-op)
    }
  }

  async listCatalogs(): Promise<CatalogReference[]> {
    try {
      const names = await this.fileSystemService.listFiles(CATALOGS_RELATIVE_DIR);
      const refs: CatalogReference[] = [];
      for (const n of names) {
        const parsed = parseFileName(n);
        if (parsed) refs.push(parsed);
      }
      return refs;
    } catch {
      return [];
    }
  }
}
