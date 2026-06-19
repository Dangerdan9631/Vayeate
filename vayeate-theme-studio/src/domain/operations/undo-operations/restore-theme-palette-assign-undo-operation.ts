import { singleton } from 'tsyringe';
import type { ThemePaletteAssignUndoValue } from '../../../model/theme-palette-assign-undo';
import { DebouncedThemePersistGateway } from '../../../gateway/theme/debounced-theme-persist-gateway';
import { ThemesStore } from '../../state/data/themes-store';
import { ThemeUiStore } from '../../state/ui/theme-ui-store';
import { applyThemePaletteAssignUndoValue } from '../../utils/theme-palette-assign-undo-utils';

/**
 * Restores palette assignment undo patches through the standard theme persist path.
 */
@singleton()
export class RestoreThemePaletteAssignUndoOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  /**
   * Runs restore for a palette assign undo patch.
   * @param patch Assignment patch to apply to the current theme.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */
  execute(patch: ThemePaletteAssignUndoValue): void {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return;

    const nextTheme = applyThemePaletteAssignUndoValue(theme, patch);
    this.themeUiStore.getStore().setHueAdjustment(0);
    this.themeUiStore.getStore().setTheme(nextTheme, true);
    this.themesStore.getStore().updateTheme(nextTheme);
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(nextTheme, (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
  }
}
