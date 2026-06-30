import { singleton } from 'tsyringe';
import type { ThemePaletteAssignUndoValue } from '../../../model/theme-palette-assign-undo';
import { ThemeUiStore } from '../../state/ui/theme-ui-store';
import { applyThemePaletteAssignUndoValue } from '../../utils/theme-palette-assign-undo-utils';
import { ApplyThemeUndoStateOperation } from './apply-theme-undo-state-operation';

/**
 * Restores palette assignment undo patches through the standard theme persist path.
 */
@singleton()
export class RestoreThemePaletteAssignUndoOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly applyThemeUndoState: ApplyThemeUndoStateOperation,
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
    this.applyThemeUndoState.execute(nextTheme);
  }
}
