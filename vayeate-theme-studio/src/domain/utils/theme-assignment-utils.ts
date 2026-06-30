import type { ColorAssignment } from '../../model/schema/theme-schemas';
import { applyHueShift, applySaturationValueAdjustment } from './color-hsl';

export interface PaletteColorAdjustments {
  hueAdjustment: number;
  saturationAdjustment: number;
  valueAdjustment: number;
}

function applyPaletteAdjustments(hex: string, adjustments: PaletteColorAdjustments): string {
  const hueAdjusted =
    adjustments.hueAdjustment === 0
      ? hex
      : applyHueShift(hex, adjustments.hueAdjustment / 100);
  if (adjustments.saturationAdjustment === 0 && adjustments.valueAdjustment === 0) {
    return hueAdjusted;
  }
  return applySaturationValueAdjustment(
    hueAdjusted,
    adjustments.saturationAdjustment / 100,
    adjustments.valueAdjustment / 100,
  );
}

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

/**
 * Applies hue, saturation, and value slider adjustments to checked color assignments.
 *
 * @param assignments - Source color assignments from the theme.
 * @param adjustments - Palette slider adjustments in UI units.
 * @param checkedRefs - Color variable keys eligible for adjustment.
 * @param options - Flags selecting whether dark and/or light values are adjusted.
 * @returns New assignments array with adjusted hex values where applicable.
 */
export function applyPaletteAdjustmentsToAssignmentsFiltered(
  assignments: readonly ColorAssignment[],
  adjustments: PaletteColorAdjustments,
  checkedRefs: ReadonlySet<string>,
  options: { applyToDark: boolean; applyToLight: boolean },
): ColorAssignment[] {
  const { applyToDark, applyToLight } = options;
  return assignments.map((a) => {
    if (!checkedRefs.has(a.colorRef)) return a;
    return {
      ...a,
      dark:
        applyToDark && a.dark
          ? { value: applyPaletteAdjustments(a.dark.value, adjustments) }
          : a.dark,
      light:
        applyToLight && !a.useDarkForLight && a.light
          ? { value: applyPaletteAdjustments(a.light.value, adjustments) }
          : a.light,
    };
  });
}
