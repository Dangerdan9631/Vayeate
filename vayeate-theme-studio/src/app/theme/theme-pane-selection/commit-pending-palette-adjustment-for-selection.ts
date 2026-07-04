import type { Theme } from '../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeHueAdjustmentOperation } from '../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeSaturationAdjustmentOperation } from '../../../domain/operations/theme-operations/palette-hue/set-theme-saturation-adjustment-operation';
import { SetThemeValueAdjustmentOperation } from '../../../domain/operations/theme-operations/palette-hue/set-theme-value-adjustment-operation';
import { SetThemeOperation } from '../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import { applyPaletteAdjustmentsToAssignmentsFiltered } from '../../../domain/utils/theme-assignment-utils';

/**
 * Palette adjustment snapshot committed immediately before a theme pane selection change.
 */
export interface PendingPaletteAdjustmentCommit {
  beforeTheme: Theme;
  afterTheme: Theme;
  hueAdjustment: number;
  saturationAdjustment: number;
  valueAdjustment: number;
}

/**
 * Dependencies required to commit pending palette slider adjustments.
 */
export interface PendingPaletteAdjustmentCommitDeps {
  themeUiStore: ThemeUiStore;
  setTheme: SetThemeOperation;
  applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation;
  setThemeHueAdjustment: SetThemeHueAdjustmentOperation;
  setThemeSaturationAdjustment: SetThemeSaturationAdjustmentOperation;
  setThemeValueAdjustment: SetThemeValueAdjustmentOperation;
}

/**
 * Commits current slider adjustments against the existing selection, then resets sliders to center.
 * @param deps Operations and store used by the selection controller.
 * @returns Commit details for undo recording, or null when sliders are already centered.
 */
export function commitPendingPaletteAdjustmentForSelection(
  deps: PendingPaletteAdjustmentCommitDeps,
): PendingPaletteAdjustmentCommit | null {
  const state = deps.themeUiStore.getStore().state;
  const theme = state.theme;
  if (!theme) return null;
  const hueAdjustment = state.hueAdjustment;
  const saturationAdjustment = state.saturationAdjustment;
  const valueAdjustment = state.valueAdjustment;
  if (hueAdjustment === 0 && saturationAdjustment === 0 && valueAdjustment === 0) return null;

  const checkedColorRefs = new Set(state.checkedColorRefs);
  const afterTheme: Theme = {
    ...theme,
    colorAssignments: applyPaletteAdjustmentsToAssignmentsFiltered(
      theme.colorAssignments,
      { hueAdjustment, saturationAdjustment, valueAdjustment },
      checkedColorRefs,
      {
        applyToDark: theme.applyPaletteToDark ?? true,
        applyToLight: theme.applyPaletteToLight ?? true,
      },
    ),
  };

  deps.setTheme.execute(afterTheme);
  deps.applyThemeStateAndSchedulePersist.execute(afterTheme);
  deps.setThemeHueAdjustment.execute(0);
  deps.setThemeSaturationAdjustment.execute(0);
  deps.setThemeValueAdjustment.execute(0);

  return {
    beforeTheme: theme,
    afterTheme,
    hueAdjustment,
    saturationAdjustment,
    valueAdjustment,
  };
}
