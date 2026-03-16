import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';

export function setVariablesSelectByType(
  setState: SetState,
  getState: GetState,
  checked?: boolean,
  variableType?: string,
): void {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const colorRefs = state.themes.checkedColorRefs;
  const contrastRefs = state.themes.checkedContrastRefs;
  let nextColor = [...colorRefs];
  let nextContrast = [...contrastRefs];
  if (variableType === 'color') {
    nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
  } else if (variableType === 'contrast') {
    nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
  }
  setThemePaneSelectionsOp(setState, nextColor, nextContrast);
}

