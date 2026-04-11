import { singleton } from 'tsyringe';
import type { Theme } from '../../model/schemas';
import { ThemeGateway } from '../theme/theme-gateway';
import { ThemesStateSetter } from '../../domain/state/theme/themes-state-reducer';

const SAVE_THEME_DEBOUNCE_MS = 400;

/**
 * Debounced theme file persist; timer and pending theme are instance state (no module-level globals).
 */
@singleton()
export class DebouncedThemePersistService {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private pendingTheme: Theme | null = null;

  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly themesStateSetter: ThemesStateSetter,
  ) {}

  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.pendingTheme = null;
  }

  /** Debounced persist via gateway; errors surface as SET_THEME_SAVE_ERROR on the setter. */
  schedule(theme: Theme): void {
    this.pendingTheme = theme;
    if (this.timeoutId !== null) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      const toSave = this.pendingTheme;
      this.pendingTheme = null;
      if (toSave) {
        this.themeGateway.saveTheme(toSave).catch((err) => {
          const message = err instanceof Error ? err.message : String(err);
          this.themesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error: message });
        });
      }
    }, SAVE_THEME_DEBOUNCE_MS);
  }
}
