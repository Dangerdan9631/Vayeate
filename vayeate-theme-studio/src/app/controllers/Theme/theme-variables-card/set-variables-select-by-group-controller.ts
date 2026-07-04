import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/Theme/theme-operations/pickers/set-theme-pane-selections-operation';
import { LoadTemplateSnapshotOperation } from '../../../../domain/operations/Template/template-operations/template-details/load-template-snapshot-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/Common/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Common/undo-operations/set-current-undo-stack-id-operation';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { CommitPendingPaletteAdjustmentForSelectionOperation } from '../../../../domain/operations/Theme/theme-operations/theme-pane-selection/commit-pending-palette-adjustment-for-selection-operation';
import { recordThemePaneSelectionUndo, themePaneSelectionsEqual } from './record-theme-pane-selection-undo';

const UNGROUPED_KEY = '__ungrouped__';

/**
 * Orchestrates set variables select by group work for the theme UI.
 */
@singleton()
export class SetVariablesSelectByGroupController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly commitPendingPaletteAdjustmentForSelection: CommitPendingPaletteAdjustmentForSelectionOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param checked Input for this call.
 * @param groupId Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(checked?: boolean, groupId?: string): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    if (!theme?.templateRef || groupId == null) return;
    const before = {
      checkedColorRefs: [...state.checkedColorRefs],
      checkedContrastRefs: [...state.checkedContrastRefs],
    };
    const template = await this.loadTemplateSnapshot.execute(
      theme.templateRef.name,
      theme.templateRef.version,
    );
    if (!template) return;
    const g = groupId === '' ? UNGROUPED_KEY : groupId;
    const colorRefsInGroup = template.colorVariables
      .filter((v: { groupRef?: string | null; key: string }) => (v.groupRef ?? UNGROUPED_KEY) === g)
      .map((v: { key: string }) => v.key);
    const contrastRefsInGroup = template.contrastVariables
      .filter((v: { groupRef?: string | null; key: string }) => (v.groupRef ?? UNGROUPED_KEY) === g)
      .map((v: { key: string }) => v.key);
    const nextColor = new Set(state.checkedColorRefs);
    const nextContrast = new Set(state.checkedContrastRefs);
    colorRefsInGroup.forEach((r: string) => (checked ? nextColor.add(r) : nextColor.delete(r)));
    contrastRefsInGroup.forEach((r: string) => (checked ? nextContrast.add(r) : nextContrast.delete(r)));
    const after = {
      checkedColorRefs: [...nextColor],
      checkedContrastRefs: [...nextContrast],
    };
    if (themePaneSelectionsEqual(before, after)) return;

    const paletteAdjustment = this.commitPendingPaletteAdjustmentForSelection.execute();
    this.setThemePaneSelections.execute(after.checkedColorRefs, after.checkedContrastRefs);
    const nextState = this.themeUiStore.getStore().state;
    await recordThemePaneSelectionUndo(
      this.recordThemeUndo,
      this.setCurrentUndoStackId,
      this.themeUiStore,
      this.templateUiStore,
      this.catalogUiStore,
      {
        description: `${checked === true ? 'Select' : 'Clear'} theme variable group: ${groupId || 'ungrouped'}`,
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


