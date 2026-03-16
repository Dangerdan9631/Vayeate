import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';

export function setVariablesSelectAll(
  setState: SetState,
  getState: GetState,
  checked?: boolean,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
  const nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
  setThemePaneSelectionsOp(setState, nextColor, nextContrast);
}

