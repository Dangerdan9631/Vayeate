import { singleton } from 'tsyringe';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import type { TokenizedPreview } from '../../../../model/Theme/preview-types';
import type { Template } from '../../../../model/Template/schema/template-schemas';
import type { ScopeColorMap } from '../../../operations/Theme/theme-operations/theme-utils/scope-resolver-operation';
import { initialThemePreviewState, type ThemePreviewState } from './theme-preview-state';

interface ThemePreviewStoreState {
  state: ThemePreviewState;
  setFilterText: (value: string) => void;
  setSelectedSampleKey: (value: string) => void;
  setEditorPreviews: (previews: TokenizedPreview[]) => void;
  setLoadedTemplate: (template: Template | null) => void;
  setScopeColorMap: (scopeColorMap: ScopeColorMap) => void;
}

/**
 * Zustand store for theme preview pane selection and preview content.
 */
@singleton()
export class ThemePreviewStore {
  private store = createStore<ThemePreviewStoreState>()(
    immer((set): ThemePreviewStoreState => ({
      state: initialThemePreviewState,
      setFilterText: (value: string) => set((storeState) => {
        storeState.state.filterText = value;
      }),
      setSelectedSampleKey: (value: string) => set((storeState) => {
        storeState.state.selectedSampleKey = value;
      }),
      setEditorPreviews: (previews: TokenizedPreview[]) => set((storeState) => {
        storeState.state.editorPreviews = previews;
        storeState.state.editorPreviewsGeneration += 1;
      }),
      setLoadedTemplate: (template: Template | null) => set((storeState) => {
        (storeState.state as ThemePreviewState).loadedTemplateForTheme = template;
        storeState.state.scopeTemplateInputsGeneration += 1;
      }),
      setScopeColorMap: (scopeColorMap: ScopeColorMap) => set((storeState) => {
        storeState.state.scopeColorMap = scopeColorMap;
      }),
    }))
  );

  /**
   * Zustand store API for React subscriptions via viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current snapshot and mutation methods for domain operations.
   * @returns Live theme preview store state and setters.
   */
  getStore(): ThemePreviewStoreState {
    return this.store.getState();
  }
}
