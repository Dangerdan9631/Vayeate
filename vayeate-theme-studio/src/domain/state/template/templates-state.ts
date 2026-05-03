import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schema/primitives';
import type { Template } from '../../../model/schema/template-schemas';
import type { TemplateReference } from '../../../model/schema/theme-schemas';

export interface TemplateState {
  isLoaded: boolean;
  template: Template | null;
}

export interface TemplateVersions {
  [version: string]: TemplateState;
}

export interface TemplateMap {
  [name: string]: TemplateVersions;
}

export interface TemplatesState {
  selectedRef: TemplateReference | null;
  isCreating: boolean;
  mappingSearchText: string;
  mappingColorVariableFilter: ColorVariableKey[];
  mappingContrastVariableFilter: ContrastVariableKey[];
  mappingTokenGroupSelection: string;
  variablesSearchText: string;
  addGroupName: string;
  addVariableName: string;
  templates: TemplateMap;
}

export const initialTemplatesState: TemplatesState = {
  selectedRef: null,
  isCreating: false,
  mappingSearchText: '',
  mappingColorVariableFilter: [],
  mappingContrastVariableFilter: [],
  mappingTokenGroupSelection: '',
  variablesSearchText: '',
  addGroupName: '',
  addVariableName: '',
  templates: {},
};
