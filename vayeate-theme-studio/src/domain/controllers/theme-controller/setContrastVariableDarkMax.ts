import type { Theme } from '../../../model/schemas';
import type { ContrastVariableKey } from '../../../model/schemas';
import { setTheme, type SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { parseContrastValue, updateContrastAssignment } from './_helpers';
import { saveTheme } from './saveTheme';

export function setContrastVariableDarkMax(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const num = value === '' || value == null ? null : parseContrastValue(value);
  const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
    max: num,
  });
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}
