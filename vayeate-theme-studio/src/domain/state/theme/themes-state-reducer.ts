import type { AppState } from '../app-state';
import type { GenerateResult, ThemeStoreMap, ThemesState } from './themes-state';
import type { Template, Theme, ThemeReference } from '../../../model/schemas';
import type { TokenizedPreview } from '../../../model/preview-types';

/** Single theme entry payload for batch set. */
export interface ThemeEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  theme?: Theme;
}

export type ThemesStateUpdate =
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
  | { type: 'SET_THEME_MAP_ENTRY'; name: string; version: string; isLoaded: boolean; theme?: Theme }
  | { type: 'SET_THEME_MAP_ENTRIES'; entries: ThemeEntryInput[] };

export function themesStateReducer(state: AppState, update: ThemesStateUpdate): AppState {
  switch (update.type) {
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
      return {
        ...state,
        themes: {
          ...state.themes,
          variableDraftTexts: { ...state.themes.variableDraftTexts, [update.key]: update.value },
        },
      };
    case 'SET_THEME_MAP_ENTRY': {
      const byVersion = {
        ...state.themes.themeMap[update.name],
        [update.version]: { isLoaded: update.isLoaded, theme: update.theme ?? undefined },
      };
      const themeMap = { ...state.themes.themeMap, [update.name]: byVersion };
      return { ...state, themes: { ...state.themes, themeMap } };
    }
    case 'SET_THEME_MAP_ENTRIES': {
      const themeMap: ThemeStoreMap = {};
      for (const entry of update.entries) {
        if (!themeMap[entry.name]) themeMap[entry.name] = {};
        themeMap[entry.name]![entry.version] = { isLoaded: entry.isLoaded, theme: entry.theme ?? undefined };
      }
      return { ...state, themes: { ...state.themes, themeMap } };
    }
    default:
      return state;
  }
}

export type SetThemesState = (update: ThemesStateUpdate) => void;
export class ThemesStateSetter {
  constructor(private readonly set: SetThemesState) { }

  apply(update: ThemesStateUpdate): void {
    this.set(update);
  }
}

export type GetThemesState = () => ThemesState;
export class ThemesStateGetter {
  constructor(private readonly get: GetThemesState) {}

  current(): ThemesState {
    return this.get();
  }
}
