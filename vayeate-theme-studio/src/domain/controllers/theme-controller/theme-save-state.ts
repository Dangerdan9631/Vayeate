import type { Theme } from '../../../model/schemas';
import {
  saveTheme as saveThemeOp,
  setThemeSaveError,
  type SetState,
} from '../../operations/theme-operations';

const SAVE_THEME_DEBOUNCE_MS = 400;

let saveThemeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pendingThemeToSave: Theme | null = null;

export function clearPendingSave(): void {
  if (saveThemeTimeoutId !== null) {
    clearTimeout(saveThemeTimeoutId);
    saveThemeTimeoutId = null;
  }
  pendingThemeToSave = null;
}

export function scheduleDebouncedSave(setState: SetState, theme: Theme): void {
  pendingThemeToSave = theme;
  if (saveThemeTimeoutId !== null) clearTimeout(saveThemeTimeoutId);
  saveThemeTimeoutId = setTimeout(() => {
    saveThemeTimeoutId = null;
    const toSave = pendingThemeToSave;
    pendingThemeToSave = null;
    if (toSave) {
      saveThemeOp(toSave).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setThemeSaveError(setState, message);
      });
    }
  }, SAVE_THEME_DEBOUNCE_MS);
}
