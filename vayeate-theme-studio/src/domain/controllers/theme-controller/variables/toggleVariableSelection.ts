import type { ColorVariableKey, ContrastVariableKey } from '../../../../model/schemas';
import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';

/** Toggle one variable (color or contrast) in selection; ref determines which set to update. */
export function toggleVariableSelection(
  setState: SetState,
  getState: GetState,
  checked: boolean,
  ref: ColorVariableKey | ContrastVariableKey,
): void {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const colorSet = new Set(state.themes.checkedColorRefs);
  const contrastSet = new Set(state.themes.checkedContrastRefs);
  const isColor = theme.colorAssignments.some((a) => a.colorRef === ref);
  if (isColor) {
    if (checked) colorSet.add(ref);
    else colorSet.delete(ref);
    setThemePaneSelectionsOp(setState, [...colorSet], state.themes.checkedContrastRefs);
  } else {
    if (checked) contrastSet.add(ref);
    else contrastSet.delete(ref);
    setThemePaneSelectionsOp(setState, state.themes.checkedColorRefs, [...contrastSet]);
  }
}


