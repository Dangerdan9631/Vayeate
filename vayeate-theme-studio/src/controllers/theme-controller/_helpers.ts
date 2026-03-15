import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastAssignmentValue,
} from '../../model/schemas';
import { applyHueShift } from '../../core/color';

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

/** Normalize hex string for palette; returns null if invalid. */
export function normalizeHexForPalette(hex: string): string | null {
  const s = (hex ?? '').trim().toLowerCase();
  const withHash = s.startsWith('#') ? s : s ? `#${s}` : '';
  if (!withHash) return null;
  const bare = withHash.slice(1);
  if (!/^[0-9a-f]+$/.test(bare) || (bare.length !== 3 && bare.length !== 6 && bare.length !== 8))
    return null;
  const expanded =
    bare.length === 3 ? bare.split('').map((c) => c + c).join('') : bare;
  return `#${expanded}`;
}

/** Normalize hex for variables; returns null if invalid. */
export function normalizeHexVar(hex: string): string | null {
  const s = (hex ?? '').trim().toLowerCase();
  const withHash = s.startsWith('#') ? s : s ? `#${s}` : '';
  if (!withHash) return null;
  const bare = withHash.slice(1);
  if (!/^[0-9a-f]+$/.test(bare) || (bare.length !== 3 && bare.length !== 6 && bare.length !== 8))
    return null;
  const expanded = bare.length === 3 ? bare.split('').map((c) => c + c).join('') : bare;
  return `#${expanded}`;
}

export function parseContrastValue(v: string | number): number | null {
  const n = typeof v === 'number' ? v : Number.parseFloat(String(v));
  if (Number.isNaN(n) || n < 1 || n > 10) return null;
  return n;
}

export function updateContrastAssignment(
  assignments: readonly ContrastAssignment[],
  contrastRef: string,
  mode: 'dark' | 'light',
  update: Partial<ContrastAssignmentValue>,
): ContrastAssignment[] {
  return assignments.map((a) => {
    if (a.contrastVariableRef !== contrastRef) return a;
    const current = mode === 'dark' ? a.dark : a.light;
    const base = current ?? {
      value: 1,
      comparisonMethod: 'greaterThan' as const,
      min: null,
      max: null,
    };
    const merged = { ...base, ...update };
    return { ...a, [mode]: merged } as ContrastAssignment;
  });
}
