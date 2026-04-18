import { castDraft } from 'immer';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schema/primitives';
import type { Template } from '../../../model/schema/template-schemas';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { initialTemplatesState, type TemplateStoreMap, type TemplatesState } from './templates-state';

export interface TemplateEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  template?: Template;
}

interface TemplatesStoreState {
  state: TemplatesState;
  setSelectedRef: (ref: TemplateReference | null) => void;
  setTemplate: (template: Template | null) => void;
  setIsCreating: (value: boolean) => void;
  setCreateDialogOpen: (value: boolean) => void;
  setCreateFormName: (value: string) => void;
  setMappingSearchText: (value: string) => void;
  setMappingColorVariableFilter: (values: ColorVariableKey[]) => void;
  setMappingContrastVariableFilter: (values: ContrastVariableKey[]) => void;
  setMappingTokenGroupSelection: (value: string) => void;
  setVariablesSearchText: (value: string) => void;
  setAddGroupName: (value: string) => void;
  setAddVariableName: (value: string) => void;
  setTemplateMapEntry: (name: string, version: string, isLoaded: boolean, template?: Template) => void;
  setTemplateMapEntries: (entries: TemplateEntryInput[]) => void;
}

@singleton()
export class TemplatesStore {
  private store = createStore<TemplatesStoreState>()(
    immer((set): TemplatesStoreState => ({
      state: initialTemplatesState,
      setSelectedRef: (ref: TemplateReference | null) =>
        set((storeState) => {
          storeState.state.selectedRef = ref;
        }),
      setTemplate: (template: Template | null) =>
        set((storeState) => {
          storeState.state.template = castDraft(template);
        }),
      setIsCreating: (value: boolean) =>
        set((storeState) => {
          storeState.state.isCreating = value;
        }),
      setCreateDialogOpen: (value: boolean) =>
        set((storeState) => {
          storeState.state.isCreateDialogOpen = value;
        }),
      setCreateFormName: (value: string) =>
        set((storeState) => {
          storeState.state.createFormName = value;
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
      setTemplateMapEntry: (name: string, version: string, isLoaded: boolean, template?: Template) =>
        set((storeState) => {
          if (!storeState.state.templateMap[name]) {
            storeState.state.templateMap[name] = {};
          }
          storeState.state.templateMap[name]![version] = {
            isLoaded,
            template: castDraft(template ?? undefined),
          };
        }),
      setTemplateMapEntries: (entries: TemplateEntryInput[]) =>
        set((storeState) => {
          storeState.state.templateMap = castDraft(entries.reduce((acc, entry) => {
            if (!acc[entry.name]) {
              acc[entry.name] = {};
            }
            acc[entry.name][entry.version] = {
              isLoaded: entry.isLoaded,
              template: castDraft(entry.template ?? undefined),
            };
            return acc;
          }, {} as TemplateStoreMap));
        }),
    })),
  );

  get api() {
    return this.store;
  }

  getStore(): TemplatesStoreState {
    return this.store.getState();
  }
}
