import type { Theme } from '../../../model/schemas';
import type { ColorVariableKey } from '../../../model/schemas';
import { setTheme, type SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { normalizeHexVar } from './_helpers';
import { saveTheme } from './saveTheme';

export function setColorVariableLight(
  setState: SetState,
  getState: GetState,
  ref: ColorVariableKey | undefined,
  value: string,
): void {
  const theme = getState().themes.theme;
  if (!theme || !ref) return;
  const normalized = normalizeHexVar(value);
  const newAssignments = theme.colorAssignments.map((a) =>
    a.colorRef === ref ? { ...a, light: normalized !== null ? { value: normalized } : null } : a,
  );
  const next: Theme = { ...theme, colorAssignments: newAssignments };
  setTheme(setState, next);
  saveTheme(setState, next);
}
