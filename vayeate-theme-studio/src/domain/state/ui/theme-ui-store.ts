import { castDraft } from 'immer';
import { singleton } from 'tsyringe';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import type { Theme, ThemeReference } from '../../../model/schema/theme-schemas';
import { deriveThemePaneFields } from '../../utils/derive-theme-pane-fields';
import { initialThemeUiState, type GenerateResult, type LoadState, type ThemeUiState } from './theme-ui-state';

export interface ThemeUiStoreState {
  state: ThemeUiState;
  setPageLoadState: (loadState: LoadState) => void;
  setThemeLoadState: (loadState: LoadState) => void;
  setSelectedRef: (ref: ThemeReference | null) => void;
  setTheme: (theme: Theme | null, preserveHue?: boolean) => void;
  setThemePaneSelections: (checkedColorRefs: string[], checkedContrastRefs: string[]) => void;
  setHueAdjustment: (value: number) => void;
  setHueReferenceHex: (value: string) => void;
  setGenerateResult: (result: GenerateResult | null) => void;
  setSaveError: (error: string | null) => void;
  setAssignColorDraftText: (value: string) => void;
  setThemeVariablesSearchText: (value: string) => void;
  setOpenPickerContext: (context: string | null) => void;
  setVariableDraftText: (key: string, value: string) => void;
}

@singleton()
export class ThemeUiStore {
  private store = createStore<ThemeUiStoreState>()(
    immer((set): ThemeUiStoreState => {
      const setThemesState = (updater: (state: ThemeUiState) => ThemeUiState) => {
        set((storeState) => {
          storeState.state = castDraft(deriveThemePaneFields(updater(storeState.state)));
        });
      };

      return {
        state: initialThemeUiState,
        setPageLoadState: (loadState: LoadState) =>
          setThemesState((state) => ({ ...state, pageLoadState: loadState })),
        setThemeLoadState: (loadState: LoadState) =>
          setThemesState((state) => ({ ...state, themeLoadState: loadState })),
        setSelectedRef: (ref: ThemeReference | null) =>
          setThemesState((state) => ({ ...state, selectedRef: ref, hueAdjustment: 0 })),
        setTheme: (theme: Theme | null, preserveHue?: boolean) =>
          setThemesState((state) => ({
            ...state,
            theme,
            ...(preserveHue === true ? {} : { hueAdjustment: 0 }),
          })),
        setThemePaneSelections: (checkedColorRefs: string[], checkedContrastRefs: string[]) =>
          setThemesState((state) => ({ ...state, checkedColorRefs, checkedContrastRefs })),
        setHueAdjustment: (value: number) => setThemesState((state) => ({ ...state, hueAdjustment: value })),
        setHueReferenceHex: (value: string) =>
          setThemesState((state) => ({ ...state, hueReferenceHex: value })),
        setGenerateResult: (result: GenerateResult | null) =>
          setThemesState((state) => ({ ...state, generateResult: result })),
        setSaveError: (error: string | null) => setThemesState((state) => ({ ...state, saveError: error })),
        setAssignColorDraftText: (value: string) =>
          setThemesState((state) => ({ ...state, assignColorDraftText: value })),
        setThemeVariablesSearchText: (value: string) =>
          setThemesState((state) => ({ ...state, themeVariablesSearchText: value })),
        setOpenPickerContext: (context: string | null) =>
          setThemesState((state) => ({ ...state, openPickerContext: context })),
        setVariableDraftText: (key: string, value: string) =>
          setThemesState((state) => ({
            ...state,
            variableDraftTexts: { ...state.variableDraftTexts, [key]: value },
          })),
      };
    }),
  );

  get api() {
    return this.store;
  }

  getStore(): ThemeUiStoreState {
    return this.store.getState();
  }
}
