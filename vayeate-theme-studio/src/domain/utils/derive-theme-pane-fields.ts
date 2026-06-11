import type { ColorAssignment, TemplateReference } from '../../model/schema/theme-schemas';
import type { SelectedColorsDisplay } from '../../model/theme-pane-state';
import type { ThemeUiState } from '../state/ui/theme-ui-state';
import { computeDisplayColorAssignments } from './compute-display-color-assignments';
import { computeSelectedColorsDisplay } from './compute-selected-colors-display';
import { computeOrphanColorKeys, computeOrphanContrastKeys } from './theme-orphan-keys';

/**
 * Inputs read by {@link deriveThemePaneFields}; kept in one place for equality checks.
 */
export interface ThemePaneDerivationInputs {
  colorAssignments: readonly ColorAssignment[] | null;
  templateRef: TemplateReference | null;
  applyHueToDark: boolean;
  applyHueToLight: boolean;
  hueAdjustment: number;
  checkedColorRefs: readonly string[];
}

/**
 * Selects the theme pane slice fields that drive derived display computations.
 *
 * @param state - Current theme UI store snapshot.
 * @returns Inputs compared by {@link areThemePaneDerivationInputsEqual} before recomputing.
 */
export function selectThemePaneDerivationInputs(state: ThemeUiState): ThemePaneDerivationInputs {
  const theme = state.theme;
  return {
    colorAssignments: theme?.colorAssignments ?? null,
    templateRef: theme?.templateRef ?? null,
    applyHueToDark: theme?.applyPaletteToDark ?? true,
    applyHueToLight: theme?.applyPaletteToLight ?? true,
    hueAdjustment: state.hueAdjustment,
    checkedColorRefs: state.checkedColorRefs,
  };
}

/**
 * Shallow-compares theme pane derivation inputs for memoization guards.
 *
 * @param before - Previous derivation inputs.
 * @param after - Current derivation inputs.
 * @returns True when all tracked fields are referentially or strictly equal.
 */
export function areThemePaneDerivationInputsEqual(
  before: ThemePaneDerivationInputs,
  after: ThemePaneDerivationInputs,
): boolean {
  return (
    before.colorAssignments === after.colorAssignments &&
    before.templateRef === after.templateRef &&
    before.applyHueToDark === after.applyHueToDark &&
    before.applyHueToLight === after.applyHueToLight &&
    before.hueAdjustment === after.hueAdjustment &&
    before.checkedColorRefs === after.checkedColorRefs
  );
}

/**
 * Recomputes palette and editor preview display fields from theme pane inputs.
 *
 * @param themes - Theme UI state snapshot to derive from.
 * @returns Updated state with display assignments, selection summary, and orphan key lists.
 */
export function deriveThemePaneFields(themes: ThemeUiState): ThemeUiState {
  const inputs = selectThemePaneDerivationInputs(themes);
  const theme = themes.theme;
  const checkedColorRefs = new Set(inputs.checkedColorRefs);
  const paneDisplayColorAssignments: ColorAssignment[] = computeDisplayColorAssignments(
    theme,
    inputs.hueAdjustment,
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
    paneSelectedColorsDisplay,
    orphanColorKeys: [...computeOrphanColorKeys(theme)].sort(),
    orphanContrastKeys: [...computeOrphanContrastKeys(theme)].sort(),
  };
}
