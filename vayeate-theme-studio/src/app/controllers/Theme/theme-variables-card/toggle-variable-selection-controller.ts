import { singleton } from 'tsyringe';
import type { ColorVariableKey, ContrastVariableKey } from '../../../../model/Common/schema/primitives';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/Theme/theme-operations/pickers/set-theme-pane-selections-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/Common/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Common/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { CommitPendingPaletteAdjustmentForSelectionOperation } from '../../../../domain/operations/Theme/theme-operations/theme-pane-selection/commit-pending-palette-adjustment-for-selection-operation';
import { recordThemePaneSelectionUndo, themePaneSelectionsEqual } from './record-theme-pane-selection-undo';

/**
 * Toggle one variable (color or contrast) in selection; ref determines which set to update.
 */
/**
 * Orchestrates toggle variable selection work for the theme UI.
 */
@singleton()
export class ToggleVariableSelectionController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly commitPendingPaletteAdjustmentForSelection: CommitPendingPaletteAdjustmentForSelectionOperation,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param checked Input for this call.
 * @param ref Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(checked: boolean, ref: ColorVariableKey | ContrastVariableKey): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    if (!theme) return;
    const before = {
      checkedColorRefs: [...state.checkedColorRefs],
      checkedContrastRefs: [...state.checkedContrastRefs],
    };
    const colorSet = new Set(state.checkedColorRefs);
    const contrastSet = new Set(state.checkedContrastRefs);
    const isColor = theme.colorAssignments.some((a) => a.colorRef === ref);
    if (isColor) {
      if (checked) colorSet.add(ref);
      else colorSet.delete(ref);
    } else {
      if (checked) contrastSet.add(ref);
      else contrastSet.delete(ref);
    }
    const after = {
      checkedColorRefs: [...colorSet],
      checkedContrastRefs: [...contrastSet],
    };
    if (themePaneSelectionsEqual(before, after)) return;

    const paletteAdjustment = this.commitPendingPaletteAdjustmentForSelection.execute();
    if (isColor) {
      this.setThemePaneSelections.execute(after.checkedColorRefs, before.checkedContrastRefs);
    } else {
      this.setThemePaneSelections.execute(before.checkedColorRefs, after.checkedContrastRefs);
    }
    const nextState = this.themeUiStore.getStore().state;
    await recordThemePaneSelectionUndo(
      this.recordThemeUndo,
      this.setCurrentUndoStackId,
      this.themeUiStore,
      this.templateUiStore,
      this.catalogUiStore,
      {
        description: `${checked ? 'Select' : 'Deselect'} theme variable: ${ref}`,
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


