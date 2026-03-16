import type { Theme } from '../../../../model/schemas';
import { setTheme, type SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { saveTheme } from '../theme-details/saveTheme';

export function setPaletteClusterGroupToggled(
  setState: SetState,
  getState: GetState,
  groupId: string,
  checked: boolean,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const current = theme.paletteClusterGroupIds ?? [];
  const set = new Set(current);
  if (checked) set.add(groupId);
  else set.delete(groupId);
  const next: Theme = { ...theme, paletteClusterGroupIds: [...set] };
  setTheme(setState, next);
  saveTheme(setState, next);
}



