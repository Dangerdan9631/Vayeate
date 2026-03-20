import type { Theme } from '../../../../model/schemas';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { ContrastComparisonMethod } from '../../../../model/schemas';
import { setTheme, type SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { updateContrastAssignment } from '../../../utils/contrast-utils';
import { saveTheme } from '../theme-details/saveTheme';

export function setContrastVariableDarkMethod(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: ContrastComparisonMethod,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
    comparisonMethod: value,
  });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}




