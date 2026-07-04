import { singleton } from 'tsyringe';
import type { Theme } from '../../../../../model/Theme/schema/theme-schemas';
import type { ThemePaletteAssignUndoValue, ThemePaletteAssignUndoAssignment } from '../../../../../model/Theme/theme-palette-assign-undo';

/**
 * Builds a minimal palette assign undo payload from changed color assignments.
 * @param theme Theme containing assignment rows.
 * @param checkedColorRefs Color refs included in the assign edit.
 * @returns Patch containing only the affected assignment rows.
 */
export function buildThemePaletteAssignUndoValue(
  theme: Theme,
  checkedColorRefs: ReadonlySet<string> | readonly string[],
): ThemePaletteAssignUndoValue {
  const refs = checkedColorRefs instanceof Set ? checkedColorRefs : new Set(checkedColorRefs);
  return {
    assignments: theme.colorAssignments
      .filter((assignment) => refs.has(assignment.colorRef))
      .map((assignment) => ({
        colorRef: assignment.colorRef,
        light: assignment.light?.value ?? null,
        dark: assignment.dark?.value ?? null,
      })),
  };
}

/**
 * Applies a palette assign undo patch onto the current theme assignments.
 * @param theme Current theme snapshot.
 * @param patch Assignment rows to merge into the theme.
 * @returns Theme with patched assignment rows.
 */
export function applyThemePaletteAssignUndoValue(theme: Theme, patch: ThemePaletteAssignUndoValue): Theme {
  const patchByRef = new Map<string, ThemePaletteAssignUndoAssignment>(
    patch.assignments.map((assignment) => [assignment.colorRef, assignment]),
  );
  const colorAssignments = theme.colorAssignments.map((assignment) => {
    const patched = patchByRef.get(assignment.colorRef);
    if (!patched) return assignment;
    return {
      ...assignment,
      light: patched.light !== null ? { value: patched.light } : null,
      dark: patched.dark !== null ? { value: patched.dark } : null,
    };
  });
  return { ...theme, colorAssignments };
}

/**
 * Operation wrapper for theme theme palette assign undo utils helpers.
 */
@singleton()
export class ThemePaletteAssignUndoUtilsOperation {}


