import type { ContrastAssignment, ContrastAssignmentValue } from '../../model/schema/theme-schemas';

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
