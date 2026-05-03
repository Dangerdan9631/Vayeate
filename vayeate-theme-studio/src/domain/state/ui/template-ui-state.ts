import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schema/primitives';
import type { TemplateReference } from '../../../model/schema/theme-schemas';

export interface TemplateUiState {
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
  selectedRef: null,
  mappingSearchText: '',
  mappingColorVariableFilter: [],
  mappingContrastVariableFilter: [],
  mappingTokenGroupSelection: '',
  variablesSearchText: '',
  addGroupName: '',
  addVariableName: '',
};
