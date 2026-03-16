import type { Catalog } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';

/** Load catalog from disk without updating state. Single responsibility: read. */
export async function loadCatalogSnapshot(
  name: string,
  version: string,
): Promise<Catalog | null> {
  return catalogService.loadCatalog(name, version);
}


