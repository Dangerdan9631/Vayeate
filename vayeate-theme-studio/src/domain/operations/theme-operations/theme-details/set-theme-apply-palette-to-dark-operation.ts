import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import type { ThemeBooleanFieldEditResult } from './set-theme-apply-palette-to-light-operation';

/**
 * Updates theme.applyPaletteToDark and returns before/after for undo recording.
 */
@singleton()
export class SetThemeApplyPaletteToDarkOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
    private readonly themeGateway: ThemeGateway,
  ) {}

  execute(checked: boolean): ThemeBooleanFieldEditResult | null {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return null;

    const before = theme.applyPaletteToDark ?? true;
    const after = checked === true;
    if (before === after) {
      return { before, after, changed: false };
    }

    const next: Theme = { ...theme, applyPaletteToDark: after };
    this.persistTheme(next);
    return { before, after, changed: true };
  }

  private persistTheme(next: Theme): void {
    this.themeUiStore.getStore().setTheme(next);
    this.themesStore.getStore().updateTheme(next);
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(() => this.themeGateway.saveTheme(next), (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
  }
}
