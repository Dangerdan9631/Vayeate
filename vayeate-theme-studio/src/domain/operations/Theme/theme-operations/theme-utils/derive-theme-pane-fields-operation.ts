import { singleton } from 'tsyringe';
import type { ColorAssignment, TemplateReference } from '../../../../../model/Theme/schema/theme-schemas';
import type { SelectedColorsDisplay } from '../../../../../model/Theme/theme-pane-state';
import type { ThemeUiState } from '../../../../state/Theme/ui/theme-ui-state';
import { computeDisplayColorAssignments } from './compute-display-color-assignments-operation';
import { computeSelectedColorsDisplay } from './compute-selected-colors-display-operation';
import { computeOrphanColorKeys, computeOrphanContrastKeys } from './theme-orphan-keys-operation';

/**
 * Inputs read by {@link deriveThemePaneFields}; kept in one place for equality checks.
 */
export interface ThemePaneDerivationInputs {
  colorAssignments: readonly ColorAssignment[] | null;
  templateRef: TemplateReference | null;
  applyHueToDark: boolean;
  applyHueToLight: boolean;
  hueAdjustment: number;
  saturationAdjustment: number;
  valueAdjustment: number;
  checkedColorRefs: readonly string[];
}

/**
 * Selects the theme pane slice fields that drive derived display computations.
 *
 * @param state - Current theme UI store snapshot.
 * @returns Inputs compared by {@link ValidateAreThemePaneDerivationInputsEqual} before recomputing.
 */
export function selectThemePaneDerivationInputs(state: ThemeUiState): ThemePaneDerivationInputs {
  const theme = state.theme;
  return {
    colorAssignments: theme?.colorAssignments ?? null,
    templateRef: theme?.templateRef ?? null,
    applyHueToDark: theme?.applyPaletteToDark ?? true,
    applyHueToLight: theme?.applyPaletteToLight ?? true,
    hueAdjustment: state.hueAdjustment,
    saturationAdjustment: state.saturationAdjustment,
    valueAdjustment: state.valueAdjustment,
    checkedColorRefs: state.checkedColorRefs,
  };
}

/**
 * Options controlling which derived pane fields are updated.
 */
export interface DeriveThemePaneFieldsOptions {
  /**
   * When true, live palette assignments update but preview/cluster assignments are preserved.
   */
  deferPreview?: boolean;
}

/**
 * Recomputes palette and editor preview display fields from theme pane inputs.
 *
 * @param themes - Theme UI state snapshot to derive from.
 * @param options - When {@link DeriveThemePaneFieldsOptions.deferPreview} is true, keeps
 *   {@link ThemeUiState.panePreviewColorAssignments} unchanged for stable previews during hue drag.
 * @returns Updated state with display assignments, selection summary, and orphan key lists.
 */
export function deriveThemePaneFields(
  themes: ThemeUiState,
  options?: DeriveThemePaneFieldsOptions,
): ThemeUiState {
  const inputs = selectThemePaneDerivationInputs(themes);
  const theme = themes.theme;
  const checkedColorRefs = new Set(inputs.checkedColorRefs);
  const paneDisplayColorAssignments: ColorAssignment[] = computeDisplayColorAssignments(
    theme,
    inputs.hueAdjustment,
    inputs.saturationAdjustment,
    inputs.valueAdjustment,
    checkedColorRefs,
    inputs.applyHueToDark,
    inputs.applyHueToLight,
  );
  const paneSelectedColorsDisplay: SelectedColorsDisplay = computeSelectedColorsDisplay(
    theme,
    checkedColorRefs,
    paneDisplayColorAssignments,
    inputs.applyHueToDark,
    inputs.applyHueToLight,
  );
  return {
    ...themes,
    paneDisplayColorAssignments,
    panePreviewColorAssignments: options?.deferPreview
      ? themes.panePreviewColorAssignments
      : paneDisplayColorAssignments,
    paneSelectedColorsDisplay,
    orphanColorKeys: [...computeOrphanColorKeys(theme)].sort(),
    orphanContrastKeys: [...computeOrphanContrastKeys(theme)].sort(),
  };
}

/**
 * Operation wrapper for theme derive theme pane fields helpers.
 */
@singleton()
export class DeriveThemePaneFieldsOperation {}


