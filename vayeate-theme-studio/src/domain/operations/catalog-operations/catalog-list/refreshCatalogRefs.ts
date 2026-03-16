import type { CatalogReference } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';
import type { SetStoreState } from '../../../state/store-state-reducer';

/** List catalogs and set entries in store. Single responsibility: refresh ref list. */
export async function refreshCatalogRefs(setStoreState: SetStoreState): Promise<CatalogReference[]> {
  const refs = await catalogService.listCatalogs();
  setStoreState({
    type: 'SET_STORE_CATALOG_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
  });
  return refs;
}


