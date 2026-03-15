import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../operations/theme-operations';

export function setThemePaneSelections(
  setState: SetState,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
): void {
  setThemePaneSelectionsOp(setState, checkedColorRefs, checkedContrastRefs);
}
