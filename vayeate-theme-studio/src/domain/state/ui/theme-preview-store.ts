import { singleton } from 'tsyringe';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import type { TokenizedPreview } from '../../../model/preview-types';
import type { Template } from '../../../model/schema/template-schemas';
import { initialThemePreviewState, type ThemePreviewState } from './theme-preview-state';

interface ThemePreviewStoreState {
  state: ThemePreviewState;
  setFilterText: (value: string) => void;
  setSelectedSampleKey: (value: string) => void;
  setEditorPreviews: (previews: TokenizedPreview[]) => void;
  setLoadedTemplate: (template: Template | null) => void;
}

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
      }),
      setLoadedTemplate: (template: Template | null) => set((storeState) => {
        (storeState.state as ThemePreviewState).loadedTemplateForTheme = template;
      }),
    }))
  );

  get api() {
    return this.store;
  }

  getStore(): ThemePreviewStoreState {
    return this.store.getState();
  }
}
