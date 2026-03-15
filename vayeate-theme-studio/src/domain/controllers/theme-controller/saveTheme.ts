import type { Theme } from '../../../model/schemas';
import { setTheme, setThemeSaveError, type SetState } from '../../operations/theme-operations';
import { scheduleDebouncedSave } from './theme-save-state';

export function saveTheme(setState: SetState, theme: Theme): void {
  setTheme(setState, theme, true);
  setThemeSaveError(setState, null);
  scheduleDebouncedSave(setState, theme);
}
