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

/** Map: template name -> version -> entry */
export type TemplateStoreMap = Record<string, Record<string, TemplateEntry>>;

export interface TemplatesState {
  selectedRef: TemplateReference | null;
  template: Template | null;
  isCreating: boolean;
  createDialogOpen: boolean;
  createFormName: string;
  /** Search filter text for mappings list. */
  mappingSearchText: string;
  /** Selected color variable keys for mapping filter. */
  mappingColorVariableFilter: ColorVariableKey[];
  /** Selected contrast variable keys for mapping filter. */
  mappingContrastVariableFilter: ContrastVariableKey[];
  /** Selected token group for mapping editor display. */
  mappingTokenGroupSelection: string;
  /** Search filter text for template variables list. */
  variablesSearchText: string;
  /** Draft value for the "add group" name input field (TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE). */
  addGroupName: string;
  /** Draft value for the "add variable" name input field (TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE). */
  addVariableName: string;
  /** List index: name -> version -> loaded entry */
  templateMap: TemplateStoreMap;
}

export const initialTemplatesState: TemplatesState = {
  selectedRef: null,
  template: null,
  isCreating: false,
  createDialogOpen: false,
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

/** Derive template refs from the template map (sorted by name, then version). */
export function getTemplateRefsFromTemplateMap(map: TemplateStoreMap): TemplateReference[] {
  const refs: TemplateReference[] = [];
  for (const name of Object.keys(map).sort()) {
    for (const version of Object.keys(map[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

export function getTemplateRefsFromTemplatesState(state: TemplatesState): TemplateReference[] {
  return getTemplateRefsFromTemplateMap(state.templateMap);
}
