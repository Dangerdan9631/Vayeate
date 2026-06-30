import { singleton } from 'tsyringe';
import { CommitAssignColorTextOperation } from '../../../../domain/operations/theme-operations/palette-color-assign/commit-assign-color-text-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import type { ThemePaneState } from '../../../../model/theme-pane-state';
import { deriveUndoContext } from '../../../../model/undo-history';
import { recordPaletteColorAssignUndo } from './record-palette-color-assign-undo';

/**
 * Orchestrates assign color from picker work for the theme UI.
 */
@singleton()
export class AssignColorFromPickerController {
  constructor(
    private readonly commitAssignColorText: CommitAssignColorTextOperation,
    private readonly themeUiStore: ThemeUiStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param hex Input for this call.
 * @param _ref Input for this call.
 * @param baseState Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(hex: string, _ref?: string, baseState?: ThemePaneState | null): Promise<void> {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return;

    const context = deriveUndoContext({
      tabId: 'themes',
      templateRef: this.templateUiStore.getStore().state.selectedRef ?? theme.templateRef,
      catalogRef: this.catalogUiStore.getStore().state.selectedRef,
      themeRef: { name: theme.name, version: theme.version },
    });
    this.setCurrentUndoStackId.executeForContext(context);

    const edit = this.commitAssignColorText.execute(hex, baseState ?? undefined);
    if (!edit?.changed) return;

    await recordPaletteColorAssignUndo(this.recordThemeUndo, {
      description: `Assign palette color: ${hex.toUpperCase()}`,
      target: `${theme.name}@${theme.version}:palette-selection`,
      before: edit.before,
      after: edit.after,
    });
  }
}
