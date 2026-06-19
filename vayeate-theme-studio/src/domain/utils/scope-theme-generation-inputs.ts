import type { ColorAssignment, ContrastAssignment } from '../../model/schema/theme-schemas';
import type { ThemeUiState } from '../state/ui/theme-ui-state';

/**
 * Theme-side inputs that invalidate editor preview scope-map resolution.
 */
export interface ScopeThemeGenerationInputs {
  panePreviewColorAssignments: ThemeUiState['panePreviewColorAssignments'];
  contrastAssignments: readonly ContrastAssignment[] | null;
}

/**
 * Selects theme store fields that drive scope color map generation bumps.
 *
 * @param state - Current theme UI store snapshot.
 * @returns Inputs compared before bumping {@link ThemeUiState.scopeThemeInputsGeneration}.
 */
export function selectScopeThemeGenerationInputs(state: ThemeUiState): ScopeThemeGenerationInputs {
  return {
    panePreviewColorAssignments: state.panePreviewColorAssignments,
    contrastAssignments: state.theme?.contrastAssignments ?? null,
  };
}

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
 *
 * @param before - Previous scope theme generation inputs.
 * @param after - Current scope theme generation inputs.
 * @returns True when preview assignments and contrast assignments are value-equal.
 */
export function areScopeThemeGenerationInputsEqual(
  before: ScopeThemeGenerationInputs,
  after: ScopeThemeGenerationInputs,
): boolean {
  return (
    previewAssignmentsFingerprint(before.panePreviewColorAssignments)
      === previewAssignmentsFingerprint(after.panePreviewColorAssignments) &&
    contrastAssignmentsFingerprint(before.contrastAssignments)
      === contrastAssignmentsFingerprint(after.contrastAssignments)
  );
}
