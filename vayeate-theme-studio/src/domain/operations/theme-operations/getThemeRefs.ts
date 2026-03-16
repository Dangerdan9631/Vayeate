import { getThemeRefsFromStore } from '../../state/store-state';
import type { ThemeReference } from '../../../model/schemas';
import type { AppState } from '../../state/app-state';

/** Read current theme refs from state. Use in controllers instead of importing domain/state directly. */
export function getThemeRefs(getState: () => AppState): ThemeReference[] {
  return getThemeRefsFromStore(getState().store);
}
