import type { SetStoreState } from '../../state/store-state-reducer';
import { loadThemeRefs as loadThemeRefsOp, loadPreviews, type SetState } from '../../operations/theme-operations';

export async function loadThemeRefs(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await loadThemeRefsOp(setState, setStoreState);
  await loadPreviews(setState);
}
