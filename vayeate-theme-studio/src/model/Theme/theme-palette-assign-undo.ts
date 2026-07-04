/**
 * One color assignment slice stored in palette assign undo diffs.
 */
export interface ThemePaletteAssignUndoAssignment {
  colorRef: string;
  light: string | null;
  dark: string | null;
}

/**
 * Minimal palette assign undo payload containing only changed assignment rows.
 */
export interface ThemePaletteAssignUndoValue {
  assignments: ThemePaletteAssignUndoAssignment[];
}
