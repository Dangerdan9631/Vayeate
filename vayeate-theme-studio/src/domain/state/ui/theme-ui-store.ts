import { castDraft } from 'immer';
import { singleton } from 'tsyringe';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import type { Theme, ThemeReference } from '../../../model/schema/theme-schemas';
import {
  areThemePaneDerivationInputsEqual,
  deriveThemePaneFields,
  selectThemePaneDerivationInputs,
} from '../../utils/derive-theme-pane-fields';
import {
  areScopeThemeGenerationInputsEqual,
  selectScopeThemeGenerationInputs,
} from '../../utils/scope-theme-generation-inputs';
import type { ClusterResult } from '../../utils/color-clustering';
import { initialThemeUiState, type GenerateResult, type LoadState, type ThemeUiState } from './theme-ui-state';

/**
 * Theme pane UI snapshot plus mutation methods exposed from the store.
 */
export interface ThemeUiStoreState {
  state: ThemeUiState;
  setPageLoadState: (loadState: LoadState) => void;
  setThemeLoadState: (loadState: LoadState) => void;
  setSelectedRef: (ref: ThemeReference | null) => void;
  setTheme: (theme: Theme | null, preserveHue?: boolean) => void;
  setThemePaneSelections: (checkedColorRefs: string[], checkedContrastRefs: string[]) => void;
  setHueAdjustment: (value: number, options?: { deferPreview?: boolean }) => void;
  setSaturationAdjustment: (value: number, options?: { deferPreview?: boolean }) => void;
  setValueAdjustment: (value: number, options?: { deferPreview?: boolean }) => void;
  setHueReferenceHex: (value: string) => void;
  setPreviewClusterCountK: (value: number | null) => void;
  setGenerateResult: (result: GenerateResult | null) => void;
  setSaveError: (error: string | null) => void;
  setAssignColorDraftText: (value: string) => void;
  setThemeVariablesSearchText: (value: string) => void;
  setOpenPickerContext: (context: string | null) => void;
  setVariableDraftText: (key: string, value: string) => void;
  setPaletteClustersByGroup: (clusters: Record<string, ClusterResult[]> | null) => void;
  setPaletteClustersPending: (pending: boolean) => void;
  setPaletteClusterByDark: (value: boolean) => void;
}

/**
 * Zustand store for theme editor pane UI state and derived pane fields.
 */
@singleton()
export class ThemeUiStore {
  private store = createStore<ThemeUiStoreState>()(
    immer((set): ThemeUiStoreState => {
      const setThemesState = (
        updater: (state: ThemeUiState) => ThemeUiState,
        options?: { forceScopeThemeGenerationBump?: boolean },
      ) => {
        set((storeState) => {
          const beforeScope = selectScopeThemeGenerationInputs(storeState.state);
          const beforeInputs = selectThemePaneDerivationInputs(storeState.state);
          const nextState = updater(storeState.state);
          const afterInputs = selectThemePaneDerivationInputs(nextState);
          const derived = areThemePaneDerivationInputsEqual(beforeInputs, afterInputs)
            ? nextState
            : deriveThemePaneFields(nextState);
          const afterScope = selectScopeThemeGenerationInputs(derived);
          const shouldBump =
            options?.forceScopeThemeGenerationBump === true ||
            !areScopeThemeGenerationInputsEqual(beforeScope, afterScope);
          storeState.state = castDraft(
            shouldBump
              ? { ...derived, scopeThemeInputsGeneration: derived.scopeThemeInputsGeneration + 1 }
              : derived,
          );
        });
      };

      return {
        state: initialThemeUiState,
        setPageLoadState: (loadState: LoadState) =>
          setThemesState((state) => ({ ...state, pageLoadState: loadState })),
        setThemeLoadState: (loadState: LoadState) =>
          setThemesState((state) => ({ ...state, themeLoadState: loadState })),
        setSelectedRef: (ref: ThemeReference | null) =>
          setThemesState(
            (state) => ({
              ...state,
              selectedRef: ref,
              hueAdjustment: 0,
              saturationAdjustment: 0,
              valueAdjustment: 0,
              previewClusterCountK: null,
              paletteClustersByGroup: null,
              paletteClustersPending: false,
            }),
            { forceScopeThemeGenerationBump: true },
          ),
        setTheme: (theme: Theme | null, preserveHue?: boolean) =>
          setThemesState((state) => ({
            ...state,
            theme,
            previewClusterCountK: null,
            paletteClustersByGroup: null,
            paletteClustersPending: false,
            ...(preserveHue === true
              ? {}
              : { hueAdjustment: 0, saturationAdjustment: 0, valueAdjustment: 0 }),
          })),
        setThemePaneSelections: (checkedColorRefs: string[], checkedContrastRefs: string[]) =>
          setThemesState((state) => ({ ...state, checkedColorRefs, checkedContrastRefs })),
        setHueAdjustment: (value: number, options?: { deferPreview?: boolean }) => {
          set((storeState) => {
            const beforeScope = selectScopeThemeGenerationInputs(storeState.state);
            const beforeInputs = selectThemePaneDerivationInputs(storeState.state);
            const nextState = { ...storeState.state, hueAdjustment: value };
            const afterInputs = selectThemePaneDerivationInputs(nextState);
            const deferPreview = options?.deferPreview ?? false;
            const derived = !deferPreview || !areThemePaneDerivationInputsEqual(beforeInputs, afterInputs)
              ? deriveThemePaneFields(nextState, { deferPreview })
              : nextState;
            const afterScope = selectScopeThemeGenerationInputs(derived);
            const shouldBump =
              !deferPreview && !areScopeThemeGenerationInputsEqual(beforeScope, afterScope);
            storeState.state = castDraft(
              shouldBump
                ? { ...derived, scopeThemeInputsGeneration: derived.scopeThemeInputsGeneration + 1 }
                : derived,
            );
          });
        },
        setSaturationAdjustment: (value: number, options?: { deferPreview?: boolean }) => {
          set((storeState) => {
            const beforeScope = selectScopeThemeGenerationInputs(storeState.state);
            const beforeInputs = selectThemePaneDerivationInputs(storeState.state);
            const nextState = { ...storeState.state, saturationAdjustment: value };
            const afterInputs = selectThemePaneDerivationInputs(nextState);
            const deferPreview = options?.deferPreview ?? false;
            const derived = !deferPreview || !areThemePaneDerivationInputsEqual(beforeInputs, afterInputs)
              ? deriveThemePaneFields(nextState, { deferPreview })
              : nextState;
            const afterScope = selectScopeThemeGenerationInputs(derived);
            const shouldBump =
              !deferPreview && !areScopeThemeGenerationInputsEqual(beforeScope, afterScope);
            storeState.state = castDraft(
              shouldBump
                ? { ...derived, scopeThemeInputsGeneration: derived.scopeThemeInputsGeneration + 1 }
                : derived,
            );
          });
        },
        setValueAdjustment: (value: number, options?: { deferPreview?: boolean }) => {
          set((storeState) => {
            const beforeScope = selectScopeThemeGenerationInputs(storeState.state);
            const beforeInputs = selectThemePaneDerivationInputs(storeState.state);
            const nextState = { ...storeState.state, valueAdjustment: value };
            const afterInputs = selectThemePaneDerivationInputs(nextState);
            const deferPreview = options?.deferPreview ?? false;
            const derived = !deferPreview || !areThemePaneDerivationInputsEqual(beforeInputs, afterInputs)
              ? deriveThemePaneFields(nextState, { deferPreview })
              : nextState;
            const afterScope = selectScopeThemeGenerationInputs(derived);
            const shouldBump =
              !deferPreview && !areScopeThemeGenerationInputsEqual(beforeScope, afterScope);
            storeState.state = castDraft(
              shouldBump
                ? { ...derived, scopeThemeInputsGeneration: derived.scopeThemeInputsGeneration + 1 }
                : derived,
            );
          });
        },
        setHueReferenceHex: (value: string) =>
          setThemesState((state) => ({ ...state, hueReferenceHex: value })),
        setPreviewClusterCountK: (value: number | null) =>
          setThemesState((state) => ({ ...state, previewClusterCountK: value })),
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
        setPaletteClustersByGroup: (clusters: Record<string, ClusterResult[]> | null) =>
          set((storeState) => {
            storeState.state.paletteClustersByGroup = clusters;
            storeState.state.paletteClustersPending = false;
          }),
        setPaletteClustersPending: (pending: boolean) =>
          set((storeState) => {
            storeState.state.paletteClustersPending = pending;
          }),
        setPaletteClusterByDark: (value: boolean) =>
          set((storeState) => {
            storeState.state.paletteClusterByDark = value;
          }),
      };
    }),
  );

  /**
   * Zustand store API for React subscriptions via viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current snapshot and mutation methods for domain operations.
   * @returns Live theme pane UI store state and setters.
   */
  getStore(): ThemeUiStoreState {
    return this.store.getState();
  }
}
