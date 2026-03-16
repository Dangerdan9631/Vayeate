import type { CatalogReference } from '../../../../model/schemas';
import type { SetStoreState } from '../../../state/store-state-reducer';

export function setCatalogRefs(setStoreState: SetStoreState, refs: CatalogReference[]): void {
  setStoreState({
    type: 'SET_STORE_CATALOG_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
  });
}


