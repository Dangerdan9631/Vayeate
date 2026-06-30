import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeSaturationAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-saturation-adjustment-operation';
import { SetThemeValueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-value-adjustment-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { applyPaletteAdjustmentsToAssignmentsFiltered } from '../../../../domain/utils/theme-assignment-utils';
import { deriveUndoContext } from '../../../../model/undo-history';
import {
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_RECENTERED,
  THEME_PALETTE_SATURATION_ADJUSTMENT_SET,
  THEME_PALETTE_VALUE_ADJUSTMENT_SET,
} from '../../../../model/undo-action-types';

/**
 * Orchestrates recenter hue reference work for the theme UI.
 */
@singleton()
export class RecenterHueReferenceController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setTheme: SetThemeOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly setThemeSaturationAdjustment: SetThemeSaturationAdjustmentOperation,
    private readonly setThemeValueAdjustment: SetThemeValueAdjustmentOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @returns Promise resolved when orchestration completes.
   */
  async run(): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    const hueAdjustment = state.hueAdjustment;
    const saturationAdjustment = state.saturationAdjustment;
    const valueAdjustment = state.valueAdjustment;
    if (!theme || (hueAdjustment === 0 && saturationAdjustment === 0 && valueAdjustment === 0)) {
      this.setThemeHueAdjustment.execute(0);
      this.setThemeSaturationAdjustment.execute(0);
      this.setThemeValueAdjustment.execute(0);
      return;
    }

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    const before = theme;
    const checkedColorRefs = new Set(state.checkedColorRefs);
    const applyToDark = theme.applyPaletteToDark ?? true;
    const applyToLight = theme.applyPaletteToLight ?? true;
    const newAssignments = applyPaletteAdjustmentsToAssignmentsFiltered(
      theme.colorAssignments,
      { hueAdjustment, saturationAdjustment, valueAdjustment },
      checkedColorRefs,
      { applyToDark, applyToLight },
    );
    const nextTheme: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(nextTheme);
    this.applyThemeStateAndSchedulePersist.execute(nextTheme);
    this.setThemeHueAdjustment.execute(0);
    this.setThemeSaturationAdjustment.execute(0);
    this.setThemeValueAdjustment.execute(0);

    const target = `${theme.name}@${theme.version}:hue-recenter`;
    await this.recordThemeUndo.execute({
      description: 'Recenter hue reference',
      actionType: THEME_PALETTE_HUE_RECENTERED,
      target,
      before,
      after: nextTheme,
      extraDiffs: [
        {
          actionType: THEME_PALETTE_HUE_ADJUSTMENT_SET,
          target,
          before: hueAdjustment,
          after: 0,
        },
        {
          actionType: THEME_PALETTE_SATURATION_ADJUSTMENT_SET,
          target,
          before: saturationAdjustment,
          after: 0,
        },
        {
          actionType: THEME_PALETTE_VALUE_ADJUSTMENT_SET,
          target,
          before: valueAdjustment,
          after: 0,
        },
      ],
    });
  }
}
