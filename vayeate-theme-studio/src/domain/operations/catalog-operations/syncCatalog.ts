import type { Catalog } from '../../../model/schemas';
import { catalogService } from '../../../gateway/services/catalog-service';
import { syncCatalogTokens } from '../../../gateway/services/catalog-sync';
import { nextPatchVersion } from '../../utils/version';

/** Sync tokens from sources and return updated catalog. No setState, no save. Single responsibility: sync. */
export async function syncCatalog(
  catalog: Catalog,
  fetchUrl: (url: string) => Promise<string> = (url) => catalogService.fetchUrl(url),
): Promise<Catalog> {
  const result = await syncCatalogTokens(catalog.sources, fetchUrl);
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
