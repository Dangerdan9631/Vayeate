import type { ColorAssignment, Theme } from '../../model/schema/theme-schemas';
import { applyPaletteAdjustmentsToAssignmentsFiltered } from './theme-assignment-utils';

/**
 * Produces hue-adjusted color assignments for theme pane and preview display.
 *
 * @param theme - Loaded theme or null when none is selected.
 * @param hueAdjustment - Palette hue slider value in UI units (100 = full rotation).
 * @param saturationAdjustment - Palette saturation slider value in UI units.
 * @param valueAdjustment - Palette value slider value in UI units.
 * @param checkedColorRefs - Color variable keys eligible for hue shift.
 * @param applyHueToDark - Whether dark assignment values are shifted.
 * @param applyHueToLight - Whether light assignment values are shifted.
 * @returns Display assignments, unchanged when hue is zero or theme is null.
 */
export function computeDisplayColorAssignments(
  theme: Theme | null,
  hueAdjustment: number,
  saturationAdjustment: number,
  valueAdjustment: number,
  checkedColorRefs: ReadonlySet<string>,
  applyHueToDark: boolean,
  applyHueToLight: boolean,
): ColorAssignment[] {
  if (!theme) return [];
  if (hueAdjustment === 0 && saturationAdjustment === 0 && valueAdjustment === 0) {
    return [...theme.colorAssignments];
  }
  return applyPaletteAdjustmentsToAssignmentsFiltered(
    theme.colorAssignments,
    { hueAdjustment, saturationAdjustment, valueAdjustment },
    checkedColorRefs,
    { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
  );
}
