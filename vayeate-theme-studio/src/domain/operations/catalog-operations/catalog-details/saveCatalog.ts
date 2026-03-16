import type { Catalog } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';

/** Persist catalog to disk only. Single responsibility: save. */
export async function saveCatalog(catalog: Catalog): Promise<void> {
  await catalogService.saveCatalog(catalog);
}


