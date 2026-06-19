import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

export interface ThemeBooleanFieldEditResult {
  before: boolean;
  after: boolean;
  changed: boolean;
}

/**
 * Updates theme.applyPaletteToLight and returns before/after for undo recording.
 */
@singleton()
export class SetThemeApplyPaletteToLightOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  execute(checked: boolean): ThemeBooleanFieldEditResult | null {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return null;

    const before = theme.applyPaletteToLight ?? false;
    const after = checked === true;
    if (before === after) {
      return { before, after, changed: false };
    }

    const next: Theme = { ...theme, applyPaletteToLight: after };
    this.persistTheme(next);
    return { before, after, changed: true };
  }

  private persistTheme(next: Theme): void {
    this.themeUiStore.getStore().setTheme(next);
    this.themesStore.getStore().updateTheme(next);
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(next, (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
  }
}
