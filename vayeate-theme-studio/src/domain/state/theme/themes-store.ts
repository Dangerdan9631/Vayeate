import { castDraft } from 'immer';
import { singleton } from 'tsyringe';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import type { TokenizedPreview } from '../../../model/preview-types';
import type { Template, Theme, ThemeReference } from '../../../model/schemas';
import { deriveThemePaneFields } from '../../utils/derive-theme-pane-fields';
import { initialThemesState, type GenerateResult, type ThemeStoreMap, type ThemesState } from './themes-state';

export interface ThemeEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  theme?: Theme;
}

export interface ThemesStoreState {
  state: ThemesState;
  setSelectedRef: (ref: ThemeReference | null) => void;
  setTheme: (theme: Theme | null, preserveHue?: boolean) => void;
  setThemePaneSelections: (checkedColorRefs: string[], checkedContrastRefs: string[]) => void;
  setHueAdjustment: (value: number) => void;
  setHueReferenceHex: (value: string) => void;
  setIsCreating: (value: boolean) => void;
  setCreateDialogOpen: (value: boolean) => void;
  setCreateFormName: (value: string) => void;
  setGenerateResult: (result: GenerateResult | null) => void;
  setSaveError: (error: string | null) => void;
  setAssignColorDraftText: (value: string) => void;
  setThemeVariablesSearchText: (value: string) => void;
  setPreviewVariableFilterText: (value: string) => void;
  setSelectedPreviewSampleKey: (value: string) => void;
  setEditorPreviews: (previews: TokenizedPreview[]) => void;
  setLoadedTemplate: (template: Template | null) => void;
  setOpenPickerContext: (context: string | null) => void;
  setVariableDraftText: (key: string, value: string) => void;
  setThemeMapEntry: (name: string, version: string, isLoaded: boolean, theme?: Theme) => void;
  setThemeMapEntries: (entries: ThemeEntryInput[]) => void;
}

@singleton()
export class ThemesStore {
  private store = createStore<ThemesStoreState>()(
    immer((set): ThemesStoreState => {
      const setThemesState = (updater: (state: ThemesState) => ThemesState) => {
        set((storeState) => {
          storeState.state = castDraft(deriveThemePaneFields(updater(storeState.state)));
        });
      };

      return {
        state: initialThemesState,
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
        setIsCreating: (value: boolean) => setThemesState((state) => ({ ...state, isCreating: value })),
        setCreateDialogOpen: (value: boolean) =>
          setThemesState((state) => ({ ...state, createDialogOpen: value })),
        setCreateFormName: (value: string) =>
          setThemesState((state) => ({ ...state, createFormName: value })),
        setGenerateResult: (result: GenerateResult | null) =>
          setThemesState((state) => ({ ...state, generateResult: result })),
        setSaveError: (error: string | null) => setThemesState((state) => ({ ...state, saveError: error })),
        setAssignColorDraftText: (value: string) =>
          setThemesState((state) => ({ ...state, assignColorDraftText: value })),
        setThemeVariablesSearchText: (value: string) =>
          setThemesState((state) => ({ ...state, themeVariablesSearchText: value })),
        setPreviewVariableFilterText: (value: string) =>
          setThemesState((state) => ({ ...state, previewVariableFilterText: value })),
        setSelectedPreviewSampleKey: (value: string) =>
          setThemesState((state) => ({ ...state, selectedPreviewSampleKey: value })),
        setEditorPreviews: (previews: TokenizedPreview[]) =>
          setThemesState((state) => ({ ...state, editorPreviews: previews })),
        setLoadedTemplate: (template: Template | null) =>
          setThemesState((state) => ({ ...state, loadedTemplateForTheme: template })),
        setOpenPickerContext: (context: string | null) =>
          setThemesState((state) => ({ ...state, openPickerContext: context })),
        setVariableDraftText: (key: string, value: string) =>
          setThemesState((state) => ({
            ...state,
            variableDraftTexts: { ...state.variableDraftTexts, [key]: value },
          })),
        setThemeMapEntry: (name: string, version: string, isLoaded: boolean, theme?: Theme) =>
          setThemesState((state) => {
            const byVersion = {
              ...state.themeMap[name],
              [version]: { isLoaded, theme: theme ?? undefined },
            };
            return { ...state, themeMap: { ...state.themeMap, [name]: byVersion } };
          }),
        setThemeMapEntries: (entries: ThemeEntryInput[]) =>
          setThemesState((state) => ({
            ...state,
            themeMap: entries.reduce((themeMap, entry) => {
              if (!themeMap[entry.name]) {
                themeMap[entry.name] = {};
              }
              themeMap[entry.name]![entry.version] = {
                isLoaded: entry.isLoaded,
                theme: entry.theme ?? undefined,
              };
              return themeMap;
            }, {} as ThemeStoreMap),
          })),
      };
    }),
  );

  get api() {
    return this.store;
  }

  getStore(): ThemesStoreState {
    return this.store.getState();
  }
}

