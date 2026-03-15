import type { Theme } from '../../../model/schemas';
import { setTheme, type SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { saveTheme } from './saveTheme';

/** Template "use template" toggle: clear templateRef when unchecked (THEME_DETAILS_CATALOG_CHECKBOX = template checkbox). */
export function setThemeTemplateToggle(
  setState: SetState,
  getState: GetState,
  checked?: boolean,
): void {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  if (checked === false) {
    const withoutTemplate: Theme = { ...theme, templateRef: null };
    setTheme(setState, withoutTemplate);
    saveTheme(setState, withoutTemplate);
  }
}
