import type { CatalogReference } from '../../../model/schemas';
import { catalogService } from '../../../gateway/services/catalog-service';
import type { SetState } from './types';

/** List catalogs and set refs in state. Single responsibility: refresh ref list. */
export async function refreshCatalogRefs(setState: SetState): Promise<CatalogReference[]> {
  const refs = await catalogService.listCatalogs();
  setState({ type: 'SET_CATALOG_REFS', refs });
  return refs;
}
