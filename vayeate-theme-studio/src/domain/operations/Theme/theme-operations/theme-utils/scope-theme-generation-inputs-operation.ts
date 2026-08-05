import { singleton } from 'tsyringe';
import type { ContrastAssignment } from '../../../../../model/Theme/schema/theme-schemas';
import type { ThemeUiState } from '../../../../state/Theme/ui/theme-ui-state';

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

/**
 * Operation wrapper for theme scope theme generation inputs helpers.
 */
@singleton()
export class ScopeThemeGenerationInputsOperation {}


