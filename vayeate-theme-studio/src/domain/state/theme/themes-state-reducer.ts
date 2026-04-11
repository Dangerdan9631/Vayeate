import type { AppState } from '../app-state';
import type { GenerateResult, ThemeStoreMap, ThemesState } from './themes-state';
import type { Template, Theme, ThemeReference } from '../../../model/schemas';
import type { TokenizedPreview } from '../../../model/preview-types';
import { deriveThemePaneFields } from '../../utils/derive-theme-pane-fields';

function patchThemes(state: AppState, patch: Partial<ThemesState>): AppState {
  return { ...state, themes: deriveThemePaneFields({ ...state.themes, ...patch }) };
}

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
      return patchThemes(state, { selectedRef: update.ref, hueAdjustment: 0 });
    case 'SET_THEME':
      return patchThemes(state, {
        theme: update.theme,
        ...(update.preserveHue === true ? {} : { hueAdjustment: 0 }),
      });
    case 'SET_THEME_PANE_SELECTIONS':
      return patchThemes(state, {
        checkedColorRefs: update.checkedColorRefs,
        checkedContrastRefs: update.checkedContrastRefs,
      });
    case 'SET_THEME_HUE_ADJUSTMENT':
      return patchThemes(state, { hueAdjustment: update.value });
    case 'SET_THEME_HUE_REFERENCE_HEX':
      return patchThemes(state, { hueReferenceHex: update.value });
    case 'SET_THEME_IS_CREATING':
      return patchThemes(state, { isCreating: update.value });
    case 'SET_THEME_CREATE_DIALOG_OPEN':
      return patchThemes(state, { createDialogOpen: update.value });
    case 'SET_THEME_CREATE_FORM_NAME':
      return patchThemes(state, { createFormName: update.value });
    case 'SET_GENERATE_RESULT':
      return patchThemes(state, { generateResult: update.result });
    case 'SET_THEME_SAVE_ERROR':
      return patchThemes(state, { saveError: update.error });
    case 'SET_ASSIGN_COLOR_DRAFT_TEXT':
      return patchThemes(state, { assignColorDraftText: update.value });
    case 'SET_THEME_VARIABLES_SEARCH_TEXT':
      return patchThemes(state, { themeVariablesSearchText: update.value });
    case 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT':
      return patchThemes(state, { previewVariableFilterText: update.value });
    case 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY':
      return patchThemes(state, { selectedPreviewSampleKey: update.value });
    case 'SET_THEME_EDITOR_PREVIEWS':
      return patchThemes(state, { editorPreviews: update.previews });
    case 'SET_THEME_LOADED_TEMPLATE':
      return patchThemes(state, { loadedTemplateForTheme: update.template });
    case 'SET_THEME_OPEN_PICKER_CONTEXT':
      return patchThemes(state, { openPickerContext: update.context });
    case 'SET_THEME_VARIABLE_DRAFT_TEXT':
      return patchThemes(state, {
        variableDraftTexts: { ...state.themes.variableDraftTexts, [update.key]: update.value },
      });
    case 'SET_THEME_MAP_ENTRY': {
      const byVersion = {
        ...state.themes.themeMap[update.name],
        [update.version]: { isLoaded: update.isLoaded, theme: update.theme ?? undefined },
      };
      const themeMap = { ...state.themes.themeMap, [update.name]: byVersion };
      return patchThemes(state, { themeMap });
    }
    case 'SET_THEME_MAP_ENTRIES': {
      const themeMap: ThemeStoreMap = {};
      for (const entry of update.entries) {
        if (!themeMap[entry.name]) themeMap[entry.name] = {};
        themeMap[entry.name]![entry.version] = { isLoaded: entry.isLoaded, theme: entry.theme ?? undefined };
      }
      return patchThemes(state, { themeMap });
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
