import type { Theme } from '../../../../model/schemas';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { ContrastValue } from '../../../../model/schemas';
import { setTheme, type SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { parseContrastValue, updateContrastAssignment } from '../shared-flows';
import { saveTheme } from '../theme-details/saveTheme';

export function setContrastVariableDarkValue(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: ContrastValue,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const num = typeof value === 'number' ? value : parseContrastValue(String(value));
  if (num == null) return;
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
    value: num,
  });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}




