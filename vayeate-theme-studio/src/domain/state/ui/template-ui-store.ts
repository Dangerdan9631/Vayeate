import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schema/primitives';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { initialTemplateUiState, type LoadState, type TemplateUiState } from './template-ui-state';

interface TemplateUiStoreState {
  state: TemplateUiState;
  setPageLoadState: (loadState: LoadState) => void;
  setTemplateLoadState: (loadState: LoadState) => void;
  selectTemplate: (ref: TemplateReference | null) => void;
  setMappingSearchText: (value: string) => void;
  setMappingColorVariableFilter: (values: ColorVariableKey[]) => void;
  setMappingContrastVariableFilter: (values: ContrastVariableKey[]) => void;
  setMappingTokenGroupSelection: (value: string) => void;
  setVariablesSearchText: (value: string) => void;
  setAddGroupName: (value: string) => void;
  setAddVariableName: (value: string) => void;
}

/**
 * Zustand store for template editor pane UI state and in-progress edits.
 */
@singleton()
export class TemplateUiStore {
  private store = createStore<TemplateUiStoreState>()(
    immer((set): TemplateUiStoreState => ({
      state: initialTemplateUiState,
      setPageLoadState: (loadState: LoadState) =>
        set((storeState) => {
          storeState.state.pageLoadState = loadState;
        }),
      setTemplateLoadState: (loadState: LoadState) =>
        set((storeState) => {
          storeState.state.templateLoadState = loadState;
        }),
      selectTemplate: (ref: TemplateReference | null) =>
        set((storeState) => {
          storeState.state.selectedRef = ref;
        }),
      setMappingSearchText: (value: string) =>
        set((storeState) => {
          storeState.state.mappingSearchText = value;
        }),
      setMappingColorVariableFilter: (values: ColorVariableKey[]) =>
        set((storeState) => {
          storeState.state.mappingColorVariableFilter = values;
        }),
      setMappingContrastVariableFilter: (values: ContrastVariableKey[]) =>
        set((storeState) => {
          storeState.state.mappingContrastVariableFilter = values;
        }),
      setMappingTokenGroupSelection: (value: string) =>
        set((storeState) => {
          storeState.state.mappingTokenGroupSelection = value;
        }),
      setVariablesSearchText: (value: string) =>
        set((storeState) => {
          storeState.state.variablesSearchText = value;
        }),
      setAddGroupName: (value: string) =>
        set((storeState) => {
          storeState.state.addGroupName = value;
        }),
      setAddVariableName: (value: string) =>
        set((storeState) => {
          storeState.state.addVariableName = value;
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
   * @returns Live template pane UI store state and setters.
   */
  getStore(): TemplateUiStoreState {
    return this.store.getState();
  }
}
