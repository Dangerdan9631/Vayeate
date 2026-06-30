import type { ColorVariableKey, ContrastVariableKey, StyleVariableKey } from '../../../model/schema/primitives';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import type { TemplateMappingId } from '../../../model/template-mapping-assignment';
import type { TemplateVariableKind } from '../../../model/template-variable-kind';

/**
 * Load phase for template page or selected template content.
 */
export type LoadState = 'unloaded' | 'loading' | 'loaded';

const UNGROUPED_ADD_VARIABLE_DRAFT_KEY = '__ungrouped__';

export function getTemplateAddVariableDraftKey(
  variableKind: TemplateVariableKind,
  groupRef: string | null,
): string {
  return `${variableKind}:${groupRef ?? UNGROUPED_ADD_VARIABLE_DRAFT_KEY}`;
}

/**
 * Template editor pane UI state including selection, mapping filters, and add-token drafts.
 */
export interface TemplateUiState {
  pageLoadState: LoadState;
  templateLoadState: LoadState;
  selectedRef: TemplateReference | null;
  mappingSearchText: string;
  mappingColorVariableFilter: ColorVariableKey[];
  mappingContrastVariableFilter: ContrastVariableKey[];
  mappingStyleVariableFilter: StyleVariableKey[];
  mappingTokenGroupSelection: string;
  selectedMappingIds: TemplateMappingId[];
  variablesSearchText: string;
  addGroupName: string;
  addVariableNames: Record<string, string>;
}

/**
 * Default template pane UI state before a template is selected or loaded.
 */
export const initialTemplateUiState: TemplateUiState = {
  pageLoadState: 'unloaded',
  templateLoadState: 'unloaded',
  selectedRef: null,
  mappingSearchText: '',
  mappingColorVariableFilter: [],
  mappingContrastVariableFilter: [],
  mappingStyleVariableFilter: [],
  mappingTokenGroupSelection: '',
  selectedMappingIds: [],
  variablesSearchText: '',
  addGroupName: '',
  addVariableNames: {},
};
