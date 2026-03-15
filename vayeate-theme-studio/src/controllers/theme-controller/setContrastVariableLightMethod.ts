import type { Theme } from '../../model/schemas';
import type { ContrastVariableKey } from '../../model/schemas';
import type { ContrastComparisonMethod } from '../../model/schemas';
import { setTheme, type SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { updateContrastAssignment } from './_helpers';
import { saveTheme } from './saveTheme';

export function setContrastVariableLightMethod(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: ContrastComparisonMethod,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'light', {
    comparisonMethod: value,
  });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}
