import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schemas';
import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';

/** Toggle one variable (color or contrast) in selection; ref determines which set to update. */
export function toggleVariableSelection(
  setState: SetState,
  getState: GetState,
  checked: boolean | undefined,
  ref: ColorVariableKey | ContrastVariableKey | undefined,
): void {
  if (ref == null) return;
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const colorSet = new Set(state.themes.checkedColorRefs);
  const contrastSet = new Set(state.themes.checkedContrastRefs);
  const isColor = theme.colorAssignments.some((a) => a.colorRef === ref);
  if (isColor) {
    if (checked === true) colorSet.add(ref);
    else if (checked === false) colorSet.delete(ref);
    else {
      if (colorSet.has(ref)) colorSet.delete(ref);
      else colorSet.add(ref);
    }
    setThemePaneSelectionsOp(setState, [...colorSet], state.themes.checkedContrastRefs);
  } else {
    if (checked === true) contrastSet.add(ref);
    else if (checked === false) contrastSet.delete(ref);
    else {
      if (contrastSet.has(ref)) contrastSet.delete(ref);
      else contrastSet.add(ref);
    }
    setThemePaneSelectionsOp(setState, state.themes.checkedColorRefs, [...contrastSet]);
  }
}
