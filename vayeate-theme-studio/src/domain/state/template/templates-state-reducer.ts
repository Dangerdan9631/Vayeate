import type { AppState } from '../app-state';
import type { TemplateStoreMap, TemplatesState } from './templates-state';
import type {
  ColorVariableKey,
  ContrastVariableKey,
  Template,
  TemplateReference,
} from '../../../model/schemas';

export interface TemplateEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  template?: Template;
}

export type TemplatesStateUpdate =
  | { type: 'SET_SELECTED_TEMPLATE_REF'; ref: TemplateReference | null }
  | { type: 'SET_TEMPLATE'; template: Template | null }
  | { type: 'SET_TEMPLATE_IS_CREATING'; value: boolean }
  | { type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_TEMPLATE_CREATE_FORM_NAME'; value: string }
  | { type: 'SET_TEMPLATE_MAPPING_SEARCH_TEXT'; value: string }
  | { type: 'SET_TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER'; values: ColorVariableKey[] }
  | { type: 'SET_TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER'; values: ContrastVariableKey[] }
  | { type: 'SET_TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION'; value: string }
  | { type: 'SET_TEMPLATE_VARIABLES_SEARCH_TEXT'; value: string }
  | { type: 'SET_TEMPLATE_ADD_GROUP_NAME'; value: string }
  | { type: 'SET_TEMPLATE_ADD_VARIABLE_NAME'; value: string }
  | { type: 'SET_TEMPLATE_MAP_ENTRY'; name: string; version: string; isLoaded: boolean; template?: Template }
  | { type: 'SET_TEMPLATE_MAP_ENTRIES'; entries: TemplateEntryInput[] };

export function templatesStateReducer(state: AppState, update: TemplatesStateUpdate): AppState {
  switch (update.type) {
    case 'SET_SELECTED_TEMPLATE_REF':
      return { ...state, templates: { ...state.templates, selectedRef: update.ref } };
    case 'SET_TEMPLATE':
      return { ...state, templates: { ...state.templates, template: update.template } };
    case 'SET_TEMPLATE_IS_CREATING':
      return { ...state, templates: { ...state.templates, isCreating: update.value } };
    case 'SET_TEMPLATE_CREATE_DIALOG_OPEN':
      return { ...state, templates: { ...state.templates, isCreateDialogOpen: update.value } };
    case 'SET_TEMPLATE_CREATE_FORM_NAME':
      return { ...state, templates: { ...state.templates, createFormName: update.value } };
    case 'SET_TEMPLATE_MAPPING_SEARCH_TEXT':
      return { ...state, templates: { ...state.templates, mappingSearchText: update.value } };
    case 'SET_TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER':
      return { ...state, templates: { ...state.templates, mappingColorVariableFilter: update.values } };
    case 'SET_TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER':
      return { ...state, templates: { ...state.templates, mappingContrastVariableFilter: update.values } };
    case 'SET_TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION':
      return { ...state, templates: { ...state.templates, mappingTokenGroupSelection: update.value } };
    case 'SET_TEMPLATE_VARIABLES_SEARCH_TEXT':
      return { ...state, templates: { ...state.templates, variablesSearchText: update.value } };
    case 'SET_TEMPLATE_ADD_GROUP_NAME':
      return { ...state, templates: { ...state.templates, addGroupName: update.value } };
    case 'SET_TEMPLATE_ADD_VARIABLE_NAME':
      return { ...state, templates: { ...state.templates, addVariableName: update.value } };
    case 'SET_TEMPLATE_MAP_ENTRY': {
      const byVersion = {
        ...state.templates.templateMap[update.name],
        [update.version]: { isLoaded: update.isLoaded, template: update.template ?? undefined },
      };
      const templateMap = { ...state.templates.templateMap, [update.name]: byVersion };
      return { ...state, templates: { ...state.templates, templateMap } };
    }
    case 'SET_TEMPLATE_MAP_ENTRIES': {
      const templateMap: TemplateStoreMap = {};
      for (const entry of update.entries) {
        if (!templateMap[entry.name]) templateMap[entry.name] = {};
        templateMap[entry.name]![entry.version] = { isLoaded: entry.isLoaded, template: entry.template ?? undefined };
      }
      return { ...state, templates: { ...state.templates, templateMap } };
    }
    default:
      return state;
  }
}

export type SetTemplatesState = (update: TemplatesStateUpdate) => void;
export class TemplatesStateSetter {
  constructor(private readonly set: SetTemplatesState) { }

  apply(update: TemplatesStateUpdate): void {
    this.set(update);
  }
}

export type GetTemplatesState = () => TemplatesState;
export class TemplatesStateGetter {
  constructor(private readonly get: GetTemplatesState) {}

  current(): TemplatesState {
    return this.get();
  }
}
