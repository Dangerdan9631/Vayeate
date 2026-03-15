import type { Theme } from '../../../model/schemas';
import type { ContrastVariableKey } from '../../../model/schemas';
import { setTheme, type SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { saveTheme } from './saveTheme';

export function setContrastUseDarkForLight(
  setState: SetState,
  getState: GetState,
  ref: ContrastVariableKey | undefined,
  checked: boolean | undefined,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const useDark = checked === true;
  const newAssignments = theme.contrastAssignments.map((a) =>
    a.contrastVariableRef === ref ? { ...a, useDarkForLight: useDark } : a,
  );
  const next: Theme = { ...theme, contrastAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}
