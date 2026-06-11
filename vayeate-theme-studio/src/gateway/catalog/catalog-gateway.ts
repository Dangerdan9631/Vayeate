import { singleton } from 'tsyringe';
import { catalogSchema } from '../../model/schema/catalog';
import { catalogReferenceSchema } from '../../model/schema/template-schemas';
import type { Catalog } from '../../model/schema/catalog';
import type { CatalogName, Version } from '../../model/schema/primitives';
import type { CatalogReference } from '../../model/schema/template-schemas';
import { FileSystemService } from '../services/file-system-service';

/**
 * Package-relative path: Theme Studio root `data/catalogs/`.
 */
const CATALOGS_RELATIVE_DIR = 'data/catalogs';

/**
 * Semver at end of filename: optional prerelease and build.
 */
const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

/**
 * Builds the on-disk catalog filename for a name and version pair.
 *
 * @param name - Catalog name segment of the filename.
 * @param version - Semver segment of the filename.
 * @returns Filename in the form `<name>-<version>.json`.
 */
function fileName(name: CatalogName, version: Version): string {
  return `${name}-${version}.json`;
}

/**
 * Resolves the package-relative path for a catalog JSON file.
 *
 * @param name - Catalog name.
 * @param version - Catalog version.
 * @returns Path under `data/catalogs/`.
 */
function catalogRelativeFilePath(name: CatalogName, version: Version): string {
  return `${CATALOGS_RELATIVE_DIR}/${fileName(name, version)}`;
}

/**
 * Parses a catalog filename (without path) into name and version, or null if not valid.
 *
 * @param baseName - Filename including extension; expected format `<catalogName>-<version>.json`.
 * @returns Parsed reference, or null when the name does not match the expected pattern.
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
 * Persists catalogs under `data/catalogs/` with zod validation on read and write.
 */
@singleton()
export class CatalogGateway {
  constructor(private readonly fileSystemService: FileSystemService) {}

  /**
   * Validates and writes a catalog JSON file for its name and version.
   *
   * @param catalog - Domain catalog to persist.
   * @returns Resolves when the file is saved.
   */
  async saveCatalog(catalog: Catalog): Promise<void> {
    const parsed = catalogSchema.safeParse(catalog);
    if (!parsed.success) {
      throw new Error('Invalid catalog: ' + parsed.error.message);
    }
    const rel = catalogRelativeFilePath(catalog.name, catalog.version);
    await this.fileSystemService.saveFile(rel, JSON.stringify(parsed.data, null, 2));
  }

  /**
   * Loads and parses a catalog file by name and version.
   *
   * @param name - Catalog name.
   * @param version - Catalog version.
   * @returns Parsed catalog, or null when missing or invalid.
   */
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

  /**
   * Deletes a catalog file; missing files are ignored.
   *
   * @param name - Catalog name.
   * @param version - Catalog version.
   * @returns Resolves when delete completes or the file is absent.
   */
  async deleteCatalog(name: string, version: string): Promise<void> {
    const rel = catalogRelativeFilePath(name, version);
    try {
      await this.fileSystemService.deleteFile(rel);
    } catch {
      // file not found (no-op)
    }
  }

  /**
   * Lists catalog name/version pairs inferred from filenames in `data/catalogs/`.
   *
   * @returns Valid catalog references, or an empty list on I/O failure.
   */
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
