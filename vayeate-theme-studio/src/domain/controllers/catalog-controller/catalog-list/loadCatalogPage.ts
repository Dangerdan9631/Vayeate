import type { SetStoreState } from '../../../state/store-state-reducer';
import { setCurrentUndoStackId, type SetState } from '../../../operations/undo-operations';
import { loadCatalogRefs } from './loadCatalogRefs';

export async function loadCatalogPage(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await loadCatalogRefs(setState, setStoreState);
  setCurrentUndoStackId(setState, null);
}

