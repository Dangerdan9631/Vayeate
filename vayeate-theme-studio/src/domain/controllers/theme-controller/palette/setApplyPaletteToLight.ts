import type { Theme } from '../../../../model/schemas';
import { setTheme, type SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { saveTheme } from '../theme-details/saveTheme';

export function setApplyPaletteToLight(
  setState: SetState,
  getState: GetState,
  checked: boolean,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const next: Theme = { ...theme, applyPaletteToLight: checked };
  setTheme(setState, next);
  saveTheme(setState, next);
}



