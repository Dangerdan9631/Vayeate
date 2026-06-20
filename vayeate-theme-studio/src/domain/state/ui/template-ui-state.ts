import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schema/primitives';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import type { TemplateMappingId } from '../../../model/template-mapping-assignment';

/**
 * Load phase for template page or selected template content.
 */
export type LoadState = 'unloaded' | 'loading' | 'loaded';

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
  mappingTokenGroupSelection: string;
  selectedMappingIds: TemplateMappingId[];
  variablesSearchText: string;
  addGroupName: string;
  addVariableName: string;
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
  mappingTokenGroupSelection: '',
  selectedMappingIds: [],
  variablesSearchText: '',
  addGroupName: '',
  addVariableName: '',
};
