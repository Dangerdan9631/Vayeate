import type { SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { saveTheme } from './saveTheme';

/** Persist current theme (THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE). */
export function persistCurrentTheme(setState: SetState, getState: GetState): void {
  const theme = getState().themes.theme;
  if (theme) saveTheme(setState, theme);
}
