import type { ColorAssignment, Theme } from '../../model/schemas';
import { applyHueToAssignmentsFiltered } from './theme-assignment-utils';

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
