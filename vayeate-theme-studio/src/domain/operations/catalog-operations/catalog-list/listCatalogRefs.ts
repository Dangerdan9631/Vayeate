import type { CatalogReference } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';

/** List catalog refs from disk without updating state. Single responsibility: read. */
export async function listCatalogRefs(): Promise<CatalogReference[]> {
  return catalogService.listCatalogs();
}


