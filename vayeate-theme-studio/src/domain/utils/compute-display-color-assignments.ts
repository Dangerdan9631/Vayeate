import type { ColorAssignment, Theme } from '../../model/schema/theme-schemas';
import { applyHueToAssignmentsFiltered } from './theme-assignment-utils';

/**
 * Produces hue-adjusted color assignments for theme pane and preview display.
 *
 * @param theme - Loaded theme or null when none is selected.
 * @param hueAdjustment - Palette hue slider value in UI units (100 = full rotation).
 * @param checkedColorRefs - Color variable keys eligible for hue shift.
 * @param applyHueToDark - Whether dark assignment values are shifted.
 * @param applyHueToLight - Whether light assignment values are shifted.
 * @returns Display assignments, unchanged when hue is zero or theme is null.
 */
export function computeDisplayColorAssignments(
  theme: Theme | null,
  hueAdjustment: number,
  checkedColorRefs: ReadonlySet<string>,
  applyHueToDark: boolean,
  applyHueToLight: boolean,
): ColorAssignment[] {
  if (!theme) return [];
  if (hueAdjustment === 0) return [...theme.colorAssignments];
  return applyHueToAssignmentsFiltered(
    theme.colorAssignments,
    hueAdjustment / 100,
    checkedColorRefs,
    { applyToDark: applyHueToDark, applyToLight: applyHueToLight },
  );
}
