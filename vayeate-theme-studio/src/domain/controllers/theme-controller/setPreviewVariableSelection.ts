import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';

/** Set pane selection to the single variable ref (THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT). */
export function setPreviewVariableSelection(
  setState: SetState,
  getState: GetState,
  value: string,
): void {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme?.templateRef || !value) return;
  const isColorRef = theme.colorAssignments.some((a) => a.colorRef === value);
  const isContrastRef = theme.contrastAssignments.some((a) => a.contrastVariableRef === value);
  if (isColorRef) {
    setThemePaneSelectionsOp(setState, [value], []);
  } else if (isContrastRef) {
    setThemePaneSelectionsOp(setState, [], [value]);
  }
}
