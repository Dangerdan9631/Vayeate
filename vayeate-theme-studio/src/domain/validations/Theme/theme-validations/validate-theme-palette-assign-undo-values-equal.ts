import { singleton } from 'tsyringe';
import type { ThemePaletteAssignUndoValue } from '../../../../model/Theme/theme-palette-assign-undo';

/**
 * Compares palette assign undo patches without serializing whole themes.
 */
@singleton()
export class ValidateThemePaletteAssignUndoValuesEqual {
  /**
   * @param before - Patch before the edit.
   * @param after - Patch after the edit.
   * @returns `true` when both patches are equivalent.
   */
  test(before: ThemePaletteAssignUndoValue, after: ThemePaletteAssignUndoValue): boolean {
    if (before.assignments.length !== after.assignments.length) return false;
    for (let index = 0; index < before.assignments.length; index += 1) {
      const left = before.assignments[index];
      const right = after.assignments[index];
      if (
        left.colorRef !== right.colorRef
        || left.light !== right.light
        || left.dark !== right.dark
      ) {
        return false;
      }
    }
    return true;
  }
}
