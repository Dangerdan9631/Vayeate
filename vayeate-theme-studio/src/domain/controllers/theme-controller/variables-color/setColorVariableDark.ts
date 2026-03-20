import type { Theme } from '../../../../model/schemas';
import type { ColorVariableKey } from '../../../../model/schemas';
import { setTheme, type SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { normalizeHexSafe } from '../../../utils/color';
import { saveTheme } from '../theme-details/saveTheme';

export function setColorVariableDark(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || !ref) return;
  const normalized = normalizeHexSafe(value);
  const newAssignments = theme.colorAssignments.map((a) =>
    a.colorRef === ref ? { ...a, dark: normalized !== null ? { value: normalized } : null } : a,
  );
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}




