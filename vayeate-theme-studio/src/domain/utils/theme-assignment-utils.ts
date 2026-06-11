import type { ColorAssignment } from '../../model/schema/theme-schemas';
import { applyHueShift } from './color-hsl';

/**
 * Applies a hue shift to checked color assignments for selected dark/light variants.
 *
 * @param assignments - Source color assignments from the theme.
 * @param shift - Hue shift in [-1, 1] (typically slider value divided by 100).
 * @param checkedRefs - Color variable keys eligible for hue adjustment.
 * @param options - Flags selecting whether dark and/or light values are shifted.
 * @returns New assignments array with hue-shifted hex values where applicable.
 */
export function applyHueToAssignmentsFiltered(
  assignments: readonly ColorAssignment[],
  shift: number,
  checkedRefs: ReadonlySet<string>,
  options: { applyToDark: boolean; applyToLight: boolean },
): ColorAssignment[] {
  const { applyToDark, applyToLight } = options;
  return assignments.map((a) => {
    if (!checkedRefs.has(a.colorRef)) return a;
    return {
      ...a,
      dark:
        applyToDark && a.dark ? { value: applyHueShift(a.dark.value, shift) } : a.dark,
      light:
        applyToLight && !a.useDarkForLight && a.light
          ? { value: applyHueShift(a.light.value, shift) }
          : a.light,
    };
  });
}
