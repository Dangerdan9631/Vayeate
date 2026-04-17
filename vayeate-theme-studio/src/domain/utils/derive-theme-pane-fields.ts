import type { ColorAssignment } from '../../model/schema/theme-schemas';
import type { SelectedColorsDisplay } from '../../model/theme-pane-state';
import type { ThemesState } from '../state/theme/themes-state';
import { computeDisplayColorAssignments } from './compute-display-color-assignments';
import { computeSelectedColorsDisplay } from './compute-selected-colors-display';
import { computeOrphanColorKeys, computeOrphanContrastKeys } from './theme-orphan-keys';

/**
 * Recomputes palette/editor preview display fields from theme + pane inputs.
 * Call after any themes slice update that can affect hue, selection, or theme data.
 */
export function deriveThemePaneFields(themes: ThemesState): ThemesState {
  const theme = themes.theme;
  const checkedColorRefs = new Set(themes.checkedColorRefs);
  const applyHueToDark = theme?.applyPaletteToDark ?? true;
  const applyHueToLight = theme?.applyPaletteToLight ?? true;
  const paneDisplayColorAssignments: ColorAssignment[] = computeDisplayColorAssignments(
    theme,
    themes.hueAdjustment,
    checkedColorRefs,
    applyHueToDark,
    applyHueToLight,
  );
  const paneSelectedColorsDisplay: SelectedColorsDisplay = computeSelectedColorsDisplay(
    theme,
    checkedColorRefs,
    paneDisplayColorAssignments,
    applyHueToDark,
    applyHueToLight,
  );
  return {
    ...themes,
    paneDisplayColorAssignments,
    paneSelectedColorsDisplay,
    orphanColorKeys: [...computeOrphanColorKeys(theme)].sort(),
    orphanContrastKeys: [...computeOrphanContrastKeys(theme)].sort(),
  };
}
