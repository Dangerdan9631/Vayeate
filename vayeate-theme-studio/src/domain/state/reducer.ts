import type { AppState, GenerateResult } from './app-state';
import type {
  AppConfig,
  Catalog,
  CatalogReference,
  CatalogType,
  ColorVariableKey,
  ContrastVariableKey,
  SourceType,
  Template,
  TemplateReference,
  Theme,
  ThemeReference,
  TokenType,
} from '../../model/schemas';
import type { TokenizedPreview } from '../../model/preview-types';

export type AppStateUpdate =
  | { type: 'SET_APP_CONFIG'; config: AppConfig }
  | { type: 'SET_COLOR_SCHEME'; scheme: 'light' | 'dark' }
  | { type: 'SET_SELECTED_REF'; ref: CatalogReference | null }
  | { type: 'SET_CATALOG'; catalog: Catalog | null }
  | { type: 'SET_LOADED_CATALOG_FOR_DISPLAY'; name: string; version: string; catalog: Catalog | null }
  | { type: 'SET_IS_CREATING'; value: boolean }
  | { type: 'SET_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_CATALOG_CREATE_FORM_NAME'; value: string }
  | { type: 'SET_CATALOG_CREATE_FORM_TYPE'; value: CatalogType }
  | { type: 'SET_CATALOG_BULK_ADD_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_CATALOG_BULK_ADD_TEXT'; value: string }
  | { type: 'SET_CATALOG_TOKENS_SEARCH_TEXT'; value: string }
  | { type: 'SET_CATALOG_NEW_SOURCE_URL'; value: string }
  | { type: 'SET_CATALOG_NEW_SOURCE_TOKEN_TYPE'; value: TokenType }
  | { type: 'SET_CATALOG_NEW_SOURCE_TYPE'; value: SourceType }
  | { type: 'SET_CATALOG_NEW_TOKEN_KEY'; value: string }
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
  | { type: 'SET_SELECTED_THEME_REF'; ref: ThemeReference | null }
  | { type: 'SET_THEME'; theme: Theme | null; preserveHue?: boolean }
  | { type: 'SET_THEME_AND_HUE'; theme: Theme | null; hueAdjustment: number }
  | { type: 'SET_THEME_PANE_SELECTIONS'; checkedColorRefs: string[]; checkedContrastRefs: string[] }
  | { type: 'SET_THEME_HUE_ADJUSTMENT'; value: number }
  | { type: 'SET_THEME_HUE_REFERENCE_HEX'; value: string }
  | { type: 'SET_THEME_IS_CREATING'; value: boolean }
  | { type: 'SET_THEME_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_THEME_CREATE_FORM_NAME'; value: string }
  | { type: 'SET_GENERATE_RESULT'; result: GenerateResult | null }
  | { type: 'SET_THEME_SAVE_ERROR'; error: string | null }
  | { type: 'SET_ASSIGN_COLOR_DRAFT_TEXT'; value: string }
  | { type: 'SET_THEME_VARIABLES_SEARCH_TEXT'; value: string }
  | { type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT'; value: string }
  | { type: 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY'; value: string }
  | { type: 'SET_THEME_EDITOR_PREVIEWS'; previews: TokenizedPreview[] }
  | { type: 'SET_THEME_LOADED_TEMPLATE'; template: Template | null }
  | { type: 'SET_THEME_OPEN_PICKER_CONTEXT'; context: string | null }
  | { type: 'SET_THEME_VARIABLE_DRAFT_TEXT'; key: string; value: string }
  | { type: 'SET_CURRENT_UNDO_STACK_ID'; stackId: string | null }
  | { type: 'SET_UNDO_LIST_VERSION'; value: number };

export function appStateReducer(state: AppState, update: AppStateUpdate): AppState {
  switch (update.type) {
    case 'SET_APP_CONFIG':
      return { ...state, appConfig: update.config };
    case 'SET_COLOR_SCHEME':
      return { ...state, appConfig: { ...state.appConfig, colorScheme: update.scheme } };
    case 'SET_SELECTED_REF':
      return { ...state, catalogs: { ...state.catalogs, selectedRef: update.ref } };
    case 'SET_CATALOG':
      return { ...state, catalogs: { ...state.catalogs, catalog: update.catalog } };
    case 'SET_LOADED_CATALOG_FOR_DISPLAY': {
      const key = `${update.name}@${update.version}`;
      const loadedForDisplay = { ...state.catalogs.loadedForDisplay };
      if (update.catalog === null) {
        delete loadedForDisplay[key];
      } else {
        loadedForDisplay[key] = update.catalog;
      }
      return { ...state, catalogs: { ...state.catalogs, loadedForDisplay } };
    }
    case 'SET_IS_CREATING':
      return { ...state, catalogs: { ...state.catalogs, isCreating: update.value } };
    case 'SET_CREATE_DIALOG_OPEN':
      return { ...state, catalogs: { ...state.catalogs, createDialogOpen: update.value } };
    case 'SET_CATALOG_CREATE_FORM_NAME':
      return { ...state, catalogs: { ...state.catalogs, createFormName: update.value } };
    case 'SET_CATALOG_CREATE_FORM_TYPE':
      return { ...state, catalogs: { ...state.catalogs, createFormType: update.value } };
    case 'SET_CATALOG_BULK_ADD_DIALOG_OPEN':
      return { ...state, catalogs: { ...state.catalogs, bulkAddDialogOpen: update.value } };
    case 'SET_CATALOG_BULK_ADD_TEXT':
      return { ...state, catalogs: { ...state.catalogs, bulkAddText: update.value } };
    case 'SET_CATALOG_TOKENS_SEARCH_TEXT':
      return { ...state, catalogs: { ...state.catalogs, tokensSearchText: update.value } };
    case 'SET_CATALOG_NEW_SOURCE_URL':
      return { ...state, catalogs: { ...state.catalogs, newSourceUrl: update.value } };
    case 'SET_CATALOG_NEW_SOURCE_TOKEN_TYPE':
      return { ...state, catalogs: { ...state.catalogs, newSourceTokenType: update.value } };
    case 'SET_CATALOG_NEW_SOURCE_TYPE':
      return { ...state, catalogs: { ...state.catalogs, newSourceType: update.value } };
    case 'SET_CATALOG_NEW_TOKEN_KEY':
      return { ...state, catalogs: { ...state.catalogs, newTokenKey: update.value } };
    case 'SET_SELECTED_TEMPLATE_REF':
      return { ...state, templates: { ...state.templates, selectedRef: update.ref } };
    case 'SET_TEMPLATE':
      return { ...state, templates: { ...state.templates, template: update.template } };
    case 'SET_TEMPLATE_IS_CREATING':
      return { ...state, templates: { ...state.templates, isCreating: update.value } };
    case 'SET_TEMPLATE_CREATE_DIALOG_OPEN':
      return { ...state, templates: { ...state.templates, createDialogOpen: update.value } };
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
    case 'SET_SELECTED_THEME_REF':
      return { ...state, themes: { ...state.themes, selectedRef: update.ref, hueAdjustment: 0 } };
    case 'SET_THEME':
      return {
        ...state,
        themes: {
          ...state.themes,
          theme: update.theme,
          ...(update.preserveHue === true ? {} : { hueAdjustment: 0 }),
        },
      };
    case 'SET_THEME_AND_HUE':
      return {
        ...state,
        themes: { ...state.themes, theme: update.theme, hueAdjustment: update.hueAdjustment },
      };
    case 'SET_THEME_PANE_SELECTIONS':
      return {
        ...state,
        themes: {
          ...state.themes,
          checkedColorRefs: update.checkedColorRefs,
          checkedContrastRefs: update.checkedContrastRefs,
        },
      };
    case 'SET_THEME_HUE_ADJUSTMENT':
      return { ...state, themes: { ...state.themes, hueAdjustment: update.value } };
    case 'SET_THEME_HUE_REFERENCE_HEX':
      return { ...state, themes: { ...state.themes, hueReferenceHex: update.value } };
    case 'SET_THEME_IS_CREATING':
      return { ...state, themes: { ...state.themes, isCreating: update.value } };
    case 'SET_THEME_CREATE_DIALOG_OPEN':
      return { ...state, themes: { ...state.themes, createDialogOpen: update.value } };
    case 'SET_THEME_CREATE_FORM_NAME':
      return { ...state, themes: { ...state.themes, createFormName: update.value } };
    case 'SET_GENERATE_RESULT':
      return { ...state, themes: { ...state.themes, generateResult: update.result } };
    case 'SET_THEME_SAVE_ERROR':
      return { ...state, themes: { ...state.themes, saveError: update.error } };
    case 'SET_ASSIGN_COLOR_DRAFT_TEXT':
      return { ...state, themes: { ...state.themes, assignColorDraftText: update.value } };
    case 'SET_THEME_VARIABLES_SEARCH_TEXT':
      return { ...state, themes: { ...state.themes, themeVariablesSearchText: update.value } };
    case 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT':
      return { ...state, themes: { ...state.themes, previewVariableFilterText: update.value } };
    case 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY':
      return { ...state, themes: { ...state.themes, selectedPreviewSampleKey: update.value } };
    case 'SET_THEME_EDITOR_PREVIEWS':
      return { ...state, themes: { ...state.themes, editorPreviews: update.previews } };
    case 'SET_THEME_LOADED_TEMPLATE':
      return { ...state, themes: { ...state.themes, loadedTemplateForTheme: update.template } };
    case 'SET_THEME_OPEN_PICKER_CONTEXT':
      return { ...state, themes: { ...state.themes, openPickerContext: update.context } };
    case 'SET_THEME_VARIABLE_DRAFT_TEXT':
      return { ...state, themes: { ...state.themes, variableDraftTexts: { ...state.themes.variableDraftTexts, [update.key]: update.value } } };
    case 'SET_CURRENT_UNDO_STACK_ID':
      return { ...state, undoStackId: { ...state.undoStackId, currentUndoStackId: update.stackId } };
    case 'SET_UNDO_LIST_VERSION':
      return { ...state, undoStackId: { ...state.undoStackId, undoListVersion: update.value } };
    default:
      return state;
  }
}
