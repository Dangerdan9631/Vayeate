import type { StyleAssignment, StyleAssignmentValue } from '../../model/schema/theme-schemas';

export type StyleAssignmentField = keyof StyleAssignmentValue;

const DEFAULT_STYLE_ASSIGNMENT_VALUE: StyleAssignmentValue = {
  bold: false,
  underline: false,
  italic: false,
  strikethrough: false,
};

export function readStyleAssignmentField(
  assignments: readonly StyleAssignment[] | undefined,
  ref: string,
  side: 'light' | 'dark',
  field: StyleAssignmentField,
): boolean {
  const assignment = assignments?.find((entry) => entry.styleVariableRef === ref);
  const sideValue = side === 'dark' ? assignment?.dark : assignment?.light;
  return sideValue?.[field] ?? false;
}

export function updateStyleAssignment(
  assignments: readonly StyleAssignment[] | undefined,
  styleRef: string,
  mode: 'dark' | 'light',
  update: Partial<StyleAssignmentValue>,
): StyleAssignment[] {
  return (assignments ?? []).map((a) => {
    if (a.styleVariableRef !== styleRef) return a;
    const current = mode === 'dark' ? a.dark : a.light;
    const merged = { ...(current ?? DEFAULT_STYLE_ASSIGNMENT_VALUE), ...update };
    return { ...a, [mode]: merged };
  });
}
