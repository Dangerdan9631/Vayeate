import type { ColorAssignment, Theme } from '../../../model/schemas';
import { applyHueShift } from '../../../domain/utils/color';
import type { SelectedColorsDisplay } from '../../../model/theme-pane-state';

export function normalizeThemeHex(hex: string): string {
  const s = (hex ?? '').trim().toLowerCase();
  return s.startsWith('#') ? s : s ? `#${s}` : '';
}

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
        applyToDark && a.dark
          ? { value: applyHueShift(a.dark.value, shift) }
          : a.dark,
      light:
        applyToLight && !a.useDarkForLight && a.light
          ? { value: applyHueShift(a.light.value, shift) }
          : a.light,
    };
  });
}

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

export function computeSelectedColorsDisplay(
  theme: Theme | null,
  checkedColorRefs: ReadonlySet<string>,
  displayColorAssignments: readonly ColorAssignment[],
  applyHueToDark: boolean,
  applyHueToLight: boolean,
): SelectedColorsDisplay {
  if (!theme || checkedColorRefs.size === 0) return { kind: 'none' };
  const effectiveHexes: string[] = [];
  for (const a of displayColorAssignments) {
    if (!checkedColorRefs.has(a.colorRef)) continue;
    if (applyHueToDark) {
      const v = a.dark?.value;
      effectiveHexes.push(normalizeThemeHex(v ?? ''));
    }
    if (applyHueToLight) {
      const v = a.useDarkForLight ? a.dark?.value : a.light?.value;
      effectiveHexes.push(normalizeThemeHex(v ?? ''));
    }
  }
  if (effectiveHexes.length === 0) return { kind: 'none' };
  const first = effectiveHexes[0];
  const allSame = effectiveHexes.every((h) => h === first);
  return allSame ? { kind: 'single', hex: first || '#808080' } : { kind: 'mixed' };
}
