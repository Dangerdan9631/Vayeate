import type { Theme } from '../../../../model/schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

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

/** Debounced persist via gateway; errors surface as SET_THEME_SAVE_ERROR on the setter. */
export function scheduleDebouncedThemePersist(
  themeGateway: ThemeGateway,
  themesStateSetter: ThemesStateSetter,
  theme: Theme,
): void {
  pendingThemeToSave = theme;
  if (saveThemeTimeoutId !== null) clearTimeout(saveThemeTimeoutId);
  saveThemeTimeoutId = setTimeout(() => {
    saveThemeTimeoutId = null;
    const toSave = pendingThemeToSave;
    pendingThemeToSave = null;
    if (toSave) {
      themeGateway.saveTheme(toSave).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        themesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error: message });
      });
    }
  }, SAVE_THEME_DEBOUNCE_MS);
}
