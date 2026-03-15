import { catalogService } from '../../../gateway/services/catalog-service';
import type { SetStoreState } from '../../../state/store-state-reducer';
import type { SetState } from './types';

/** Load catalog refs from data dir into app state and store (entries with isLoaded: false). */
export async function loadCatalogRefs(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  const refs = await catalogService.listCatalogs();
  setState({ type: 'SET_CATALOG_REFS', refs });
  setStoreState({
    type: 'SET_STORE_CATALOG_ENTRIES',
    entries: refs.map((ref) => ({ name: ref.name, version: ref.version, isLoaded: false, catalog: undefined })),
  });
}
