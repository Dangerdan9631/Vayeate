import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogService } from '../../../../gateway/services/catalog-service';
import { syncCatalogTokens } from '../../../../gateway/services/catalog-sync';
import { nextPatchVersion } from '../../../utils/version';

/** Sync tokens from sources and return updated catalog. No setState, no save. Single responsibility: sync. */
@injectable()
export class SyncCatalog {
  constructor(private readonly catalogService: CatalogService) {}

  async execute(
    catalog: Catalog,
    fetchUrl?: (url: string) => Promise<string>,
  ): Promise<Catalog> {
    const fetchFn = fetchUrl ?? ((url: string) => this.catalogService.fetchUrl(url));
    const result = await syncCatalogTokens(catalog.sources, fetchFn);
    const version = catalog.locked ? nextPatchVersion(catalog.version) : catalog.version;
    return {
      ...catalog,
      tokens: result.tokens,
      semanticTokenTypes: result.semanticTokenTypes,
      semanticTokenModifiers: result.semanticTokenModifiers,
      semanticTokenLanguages: result.semanticTokenLanguages,
      version,
      locked: true,
    };
  }
}


