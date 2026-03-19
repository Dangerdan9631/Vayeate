import type { SetStoreState } from '../../../state/store-state-reducer';
import { setCurrentUndoStackId, type SetState } from '../../../operations/undo-operations';
import { loadThemeRefs } from './loadThemeRefs';

export async function loadThemePage(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await loadThemeRefs(setState, setStoreState);
  setCurrentUndoStackId(setState, null);
}

