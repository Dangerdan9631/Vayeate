import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';

/** Set selection to a single ref (primary swatch click). */
export function setPalettePrimarySwatch(
  setState: SetState,
  getState: GetState,
  ref: string | undefined,
): void {
  if (ref == null) return;
  const state = getState();
  setThemePaneSelectionsOp(setState, [ref], state.themes.checkedContrastRefs);
}
