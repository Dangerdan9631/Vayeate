import type { Theme } from '../../../../model/schemas';
import type { ColorVariableKey } from '../../../../model/schemas';
import { setTheme, type SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { saveTheme } from '../theme-details/saveTheme';

export function setColorUseDarkForLight(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  checked: boolean | undefined,
): void {
  const theme = getState().themes.theme;
  if (!theme || ref == null) return;
  const useDark = checked === true;
  const newAssignments = theme.colorAssignments.map((a) =>
    a.colorRef === ref ? { ...a, useDarkForLight: useDark } : a,
  );
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}



