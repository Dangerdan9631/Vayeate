import type { ContrastAssignment, ContrastAssignmentValue } from '../../model/schema/theme-schemas';

/**
 * Parses a WCAG contrast ratio input into a valid numeric value.
 *
 * @param v - User or stored contrast value as string or number.
 * @returns Parsed ratio in [1, 10], or null when invalid or out of range.
 */
export function parseContrastValue(v: string | number): number | null {
  const n = typeof v === 'number' ? v : Number.parseFloat(String(v));
  if (Number.isNaN(n) || n < 1 || n > 10) return null;
  return n;
}

/**
 * Returns contrast assignments with one mode value merged for a given contrast variable.
 *
 * @param assignments - Current theme contrast assignments.
 * @param contrastRef - Contrast variable key to update.
 * @param mode - `dark` or `light` assignment slot to merge into.
 * @param update - Partial fields applied over the existing or default value.
 * @returns New assignments array with the targeted slot updated.
 */
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
    const next: ContrastAssignment = { ...a, [mode]: merged };
    return next;
  });
}
