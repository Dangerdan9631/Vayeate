import { singleton } from 'tsyringe';
import { SetThemeApplyPaletteToDarkOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-apply-palette-to-dark-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';
import { THEME_PALETTE_APPLY_TO_DARK_SET } from '../../../../model/undo-action-types';

/**
 * Orchestrates set apply palette to dark work for the theme UI.
 */
@singleton()
export class SetApplyPaletteToDarkController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setApplyPaletteToDark: SetThemeApplyPaletteToDarkOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param checked Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(checked: boolean): Promise<void> {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    const edit = this.setApplyPaletteToDark.execute(checked);
    if (!edit?.changed) return;

    await this.recordThemeUndo.execute({
      description: 'Toggle apply palette to dark',
      actionType: THEME_PALETTE_APPLY_TO_DARK_SET,
      target: `${theme.name}@${theme.version}:apply-palette-to-dark`,
      before: edit.before,
      after: edit.after,
    });
  }
}
