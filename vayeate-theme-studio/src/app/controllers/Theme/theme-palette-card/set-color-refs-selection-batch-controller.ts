import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/Theme/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/Theme/theme-operations/pickers/set-theme-pane-selections-operation';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/Theme/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeSaturationAdjustmentOperation } from '../../../../domain/operations/Theme/theme-operations/palette-hue/set-theme-saturation-adjustment-operation';
import { SetThemeValueAdjustmentOperation } from '../../../../domain/operations/Theme/theme-operations/palette-hue/set-theme-value-adjustment-operation';
import { SetThemeOperation } from '../../../../domain/operations/Theme/theme-operations/theme-details/set-theme-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/Theme/theme-undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import type { ThemeUiState } from '../../../../domain/state/Theme/ui/theme-ui-state';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { applyPaletteAdjustmentsToAssignmentsFiltered } from '../../../../domain/operations/Theme/theme-operations/theme-utils/theme-assignment-utils-operation';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';
import {
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_RECENTERED,
  THEME_PALETTE_SATURATION_ADJUSTMENT_SET,
  THEME_PALETTE_VALUE_ADJUSTMENT_SET,
  THEME_PANE_SELECTIONS_SET,
} from '../../../../model/Undo/undo-action-types';

interface ThemePaneSelectionsUndoValue {
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Applies checked state to many color variable refs in one state update (single user gesture).
 */
/**
 * Orchestrates set color refs selection batch work for the theme UI.
 */
@singleton()
export class SetColorRefsSelectionBatchController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly setThemeSaturationAdjustment: SetThemeSaturationAdjustmentOperation,
    private readonly setThemeValueAdjustment: SetThemeValueAdjustmentOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param refs Input for this call.
 * @param checked Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async run(refs: readonly string[], checked: boolean): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    if (!theme || refs.length === 0) return;

    const beforeSelections: ThemePaneSelectionsUndoValue = {
      checkedColorRefs: [...state.checkedColorRefs],
      checkedContrastRefs: [...state.checkedContrastRefs],
    };
    const colorSet = new Set(beforeSelections.checkedColorRefs);
    for (const ref of refs) {
      if (checked) colorSet.add(ref);
      else colorSet.delete(ref);
    }
    const afterSelections: ThemePaneSelectionsUndoValue = {
      checkedColorRefs: [...colorSet],
      checkedContrastRefs: beforeSelections.checkedContrastRefs,
    };

    const hasSelectionChange =
      !arraysEqual(beforeSelections.checkedColorRefs, afterSelections.checkedColorRefs) ||
      !arraysEqual(beforeSelections.checkedContrastRefs, afterSelections.checkedContrastRefs);
    const hasPendingAdjustment =
      state.hueAdjustment !== 0 ||
      state.saturationAdjustment !== 0 ||
      state.valueAdjustment !== 0;
    if (!hasSelectionChange) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    if (!hasPendingAdjustment) {
      this.setThemePaneSelections.execute(afterSelections.checkedColorRefs, afterSelections.checkedContrastRefs);
      await this.recordThemeUndo.execute({
        description: 'Color variable selection changed',
        actionType: THEME_PANE_SELECTIONS_SET,
        target: `${theme.name}@${theme.version}:pane-selections:color-variable`,
        before: beforeSelections,
        after: afterSelections,
        coalesceWithPrevious: true,
      });
      return;
    }

    const beforeTheme = theme;
    const nextTheme = this.buildAdjustedTheme(theme, state);
    this.setTheme.execute(nextTheme);
    this.applyThemeStateAndSchedulePersist.execute(nextTheme);
    this.setThemeHueAdjustment.execute(0);
    this.setThemeSaturationAdjustment.execute(0);
    this.setThemeValueAdjustment.execute(0);
    this.setThemePaneSelections.execute(afterSelections.checkedColorRefs, afterSelections.checkedContrastRefs);

    const target = `${theme.name}@${theme.version}:palette-selection-recenter`;
    await this.recordThemeUndo.execute({
      description: 'Palette selection changed',
      actionType: THEME_PALETTE_HUE_RECENTERED,
      target,
      before: beforeTheme,
      after: nextTheme,
      extraDiffs: [
        {
          actionType: THEME_PALETTE_HUE_ADJUSTMENT_SET,
          target,
          before: state.hueAdjustment,
          after: 0,
        },
        {
          actionType: THEME_PALETTE_SATURATION_ADJUSTMENT_SET,
          target,
          before: state.saturationAdjustment,
          after: 0,
        },
        {
          actionType: THEME_PALETTE_VALUE_ADJUSTMENT_SET,
          target,
          before: state.valueAdjustment,
          after: 0,
        },
        {
          actionType: THEME_PANE_SELECTIONS_SET,
          target: `${theme.name}@${theme.version}:pane-selections:color-variable`,
          before: beforeSelections,
          after: afterSelections,
        },
      ],
    });
  }

  private buildAdjustedTheme(theme: Theme, state: ThemeUiState): Theme {
    const checkedColorRefs = new Set(state.checkedColorRefs);
    const newAssignments = applyPaletteAdjustmentsToAssignmentsFiltered(
      theme.colorAssignments,
      {
        hueAdjustment: state.hueAdjustment,
        saturationAdjustment: state.saturationAdjustment,
        valueAdjustment: state.valueAdjustment,
      },
      checkedColorRefs,
      {
        applyToDark: theme.applyPaletteToDark ?? true,
        applyToLight: theme.applyPaletteToLight ?? true,
      },
    );
    return { ...theme, colorAssignments: newAssignments };
  }
}
