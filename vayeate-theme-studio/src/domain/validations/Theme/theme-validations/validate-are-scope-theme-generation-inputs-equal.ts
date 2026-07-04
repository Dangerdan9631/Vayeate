import { singleton } from 'tsyringe';
import type { ColorAssignment, ContrastAssignment } from '../../../../model/Theme/schema/theme-schemas';
import type { ScopeThemeGenerationInputs } from '../../../operations/Theme/theme-operations/theme-utils/scope-theme-generation-inputs-operation';

function previewAssignmentsFingerprint(assignments: readonly ColorAssignment[]): string {
  return JSON.stringify(
    assignments.map((assignment) => ({
      colorRef: assignment.colorRef,
      dark: assignment.dark?.value ?? null,
      light: assignment.light?.value ?? null,
      useDarkForLight: assignment.useDarkForLight,
    })),
  );
}

function contrastAssignmentsFingerprint(assignments: readonly ContrastAssignment[] | null): string {
  if (!assignments) return 'null';
  return JSON.stringify(
    assignments.map((assignment) => ({
      contrastVariableRef: assignment.contrastVariableRef,
      dark: assignment.dark,
      light: assignment.light,
      useDarkForLight: assignment.useDarkForLight,
    })),
  );
}

/**
 * Compares scope theme generation inputs for store invalidation guards.
 */
@singleton()
export class ValidateAreScopeThemeGenerationInputsEqual {
  /**
   * @param before - Previous scope theme generation inputs.
   * @param after - Current scope theme generation inputs.
   * @returns `true` when preview assignments and contrast assignments are value-equal.
   */
  test(before: ScopeThemeGenerationInputs, after: ScopeThemeGenerationInputs): boolean {
    return (
      previewAssignmentsFingerprint(before.panePreviewColorAssignments)
        === previewAssignmentsFingerprint(after.panePreviewColorAssignments) &&
      contrastAssignmentsFingerprint(before.contrastAssignments)
        === contrastAssignmentsFingerprint(after.contrastAssignments)
    );
  }
}
