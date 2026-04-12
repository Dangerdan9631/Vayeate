import type {
  ColorVariableKey,
  ContrastVariableKey,
  Template,
  TemplateReference,
} from '../../../model/schemas';

export interface TemplateEntry {
  isLoaded: boolean;
  template: Template | undefined;
}

export type TemplateStoreMap = Record<string, Record<string, TemplateEntry>>;

export interface TemplatesState {
  selectedRef: TemplateReference | null;
  template: Template | null;
  isCreating: boolean;
  isCreateDialogOpen: boolean;
  createFormName: string;
  mappingSearchText: string;
  mappingColorVariableFilter: ColorVariableKey[];
  mappingContrastVariableFilter: ContrastVariableKey[];
  mappingTokenGroupSelection: string;
  variablesSearchText: string;
  addGroupName: string;
  addVariableName: string;
  templateMap: TemplateStoreMap;
}

export const initialTemplatesState: TemplatesState = {
  selectedRef: null,
  template: null,
  isCreating: false,
  isCreateDialogOpen: false,
  createFormName: '',
  mappingSearchText: '',
  mappingColorVariableFilter: [],
  mappingContrastVariableFilter: [],
  mappingTokenGroupSelection: '',
  variablesSearchText: '',
  addGroupName: '',
  addVariableName: '',
  templateMap: {},
};

export function getTemplateRefs(map: TemplateStoreMap): TemplateReference[] {
  const refs: TemplateReference[] = [];
  for (const name of Object.keys(map).sort()) {
    for (const version of Object.keys(map[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}
