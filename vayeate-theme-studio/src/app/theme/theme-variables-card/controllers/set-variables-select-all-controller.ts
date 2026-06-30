import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { recordThemePaneSelectionUndo } from './record-theme-pane-selection-undo';

/**
 * Orchestrates set variables select all work for the theme UI.
 */
@singleton()
export class SetVariablesSelectAllController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
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
    this.setThemePaneSelections.execute(nextColor, nextContrast);
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
      },
    );
  }
}


