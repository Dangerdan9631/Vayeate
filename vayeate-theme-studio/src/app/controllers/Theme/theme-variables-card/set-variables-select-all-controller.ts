import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/Theme/theme-operations/pickers/set-theme-pane-selections-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/Theme/theme-undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { CommitPendingPaletteAdjustmentOperation } from '../../../../domain/operations/Theme/theme-operations/theme-pane-selection/commit-pending-palette-adjustment-operation';
import { recordThemePaneSelectionUndo, themePaneSelectionsEqual } from './record-theme-pane-selection-undo';

/**
 * Orchestrates set variables select all work for the theme UI.
 */
@singleton()
export class SetVariablesSelectAllController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly commitPendingPaletteAdjustment: CommitPendingPaletteAdjustmentOperation,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param checked Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(checked?: boolean): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    if (!theme) return;
    const before = {
      checkedColorRefs: [...state.checkedColorRefs],
      checkedContrastRefs: [...state.checkedContrastRefs],
    };
    const nextColor = checked === true ? theme.colorAssignments.map((a) => a.colorRef) : [];
    const nextContrast = checked === true ? theme.contrastAssignments.map((a) => a.contrastVariableRef) : [];
    const after = {
      checkedColorRefs: nextColor,
      checkedContrastRefs: nextContrast,
    };
    if (themePaneSelectionsEqual(before, after)) return;

    const paletteAdjustment = this.commitPendingPaletteAdjustment.execute();
    this.setThemePaneSelections.execute(after.checkedColorRefs, after.checkedContrastRefs);
    const nextState = this.themeUiStore.getStore().state;
    await recordThemePaneSelectionUndo(
      this.recordThemeUndo,
      this.setCurrentUndoStackId,
      this.themeUiStore,
      this.templateUiStore,
      this.catalogUiStore,
      {
        description: checked === true ? 'Select all theme variables' : 'Clear theme variable selection',
        before,
        after: {
          checkedColorRefs: [...nextState.checkedColorRefs],
          checkedContrastRefs: [...nextState.checkedContrastRefs],
        },
        paletteAdjustment,
      },
    );
  }
}


