import { catalogService } from '../../../gateway/services/catalog-service';
import type { SetStoreState } from '../../../state/store-state-reducer';
import type { SetState } from './types';

/** Load catalog refs from data dir into store (set catalog entries from ref list). */
export async function loadCatalogRefs(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  const refs = await catalogService.listCatalogs();
  setStoreState({
    type: 'SET_STORE_CATALOG_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
  });
}
