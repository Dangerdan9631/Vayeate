import type { CatalogReference } from '../../../model/schemas';
import { catalogService } from '../../../gateway/services/catalog-service';
import type { SetState } from './types';

export async function loadCatalogRefs(setState: SetState): Promise<CatalogReference[]> {
  const refs = await catalogService.listCatalogs();
  setState({ type: 'SET_CATALOG_REFS', refs });
  return refs;
}
