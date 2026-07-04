import { singleton } from 'tsyringe';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeSaturationAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-saturation-adjustment-operation';
import { SetThemeValueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-value-adjustment-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { commitPendingPaletteAdjustmentForSelection } from '../../theme-pane-selection/commit-pending-palette-adjustment-for-selection';
import { recordThemePaneSelectionUndo, themePaneSelectionsEqual } from './record-theme-pane-selection-undo';

/**
 * Orchestrates set variables select all work for the theme UI.
 */
@singleton()
export class SetVariablesSelectAllController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly setThemeSaturationAdjustment: SetThemeSaturationAdjustmentOperation,
    private readonly setThemeValueAdjustment: SetThemeValueAdjustmentOperation,
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

    const paletteAdjustment = commitPendingPaletteAdjustmentForSelection({
      themeUiStore: this.themeUiStore,
      setTheme: this.setTheme,
      applyThemeStateAndSchedulePersist: this.applyThemeStateAndSchedulePersist,
      setThemeHueAdjustment: this.setThemeHueAdjustment,
      setThemeSaturationAdjustment: this.setThemeSaturationAdjustment,
      setThemeValueAdjustment: this.setThemeValueAdjustment,
    });
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


