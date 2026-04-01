import type { Theme } from '../../../../model/schemas';
import { SaveThemeOperation, SetThemeSaveErrorOperation } from '../../../operations/theme-operations';

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

export function scheduleDebouncedSave(
  saveTheme: SaveThemeOperation,
  setThemeSaveError: SetThemeSaveErrorOperation,
  theme: Theme,
): void {
  pendingThemeToSave = theme;
  if (saveThemeTimeoutId !== null) clearTimeout(saveThemeTimeoutId);
  saveThemeTimeoutId = setTimeout(() => {
    saveThemeTimeoutId = null;
    const toSave = pendingThemeToSave;
    pendingThemeToSave = null;
    if (toSave) {
      saveTheme.execute(toSave).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setThemeSaveError.execute(message);
      });
    }
  }, SAVE_THEME_DEBOUNCE_MS);
}
