import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schema/primitives';
import type { TemplateReference } from '../../../model/schema/theme-schemas';

export type LoadState = 'unloaded' | 'loading' | 'loaded';

export interface TemplateUiState {
  pageLoadState: LoadState;
  templateLoadState: LoadState;
  selectedRef: TemplateReference | null;
  mappingSearchText: string;
  mappingColorVariableFilter: ColorVariableKey[];
  mappingContrastVariableFilter: ContrastVariableKey[];
  mappingTokenGroupSelection: string;
  variablesSearchText: string;
  addGroupName: string;
  addVariableName: string;
}

export const initialTemplateUiState: TemplateUiState = {
  pageLoadState: 'unloaded',
  templateLoadState: 'unloaded',
  selectedRef: null,
  mappingSearchText: '',
  mappingColorVariableFilter: [],
  mappingContrastVariableFilter: [],
  mappingTokenGroupSelection: '',
  variablesSearchText: '',
  addGroupName: '',
  addVariableName: '',
};
