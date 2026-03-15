import type { Theme } from '../../model/schemas';
import { setTheme, type SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { saveTheme } from './saveTheme';

export function setPaletteClusterCountK(
  setState: SetState,
  getState: GetState,
  value: number,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const k = Math.max(1, Math.min(12, value));
  const next: Theme = { ...theme, paletteClusterCountK: k };
  setTheme(setState, next);
  saveTheme(setState, next);
}
