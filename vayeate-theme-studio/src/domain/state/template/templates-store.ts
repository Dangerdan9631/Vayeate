import { castDraft } from 'immer';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import type { ColorVariableKey, ContrastVariableKey } from '../../../model/schema/primitives';
import type { Template } from '../../../model/schema/template-schemas';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { initialTemplatesState, type TemplateMap, type TemplatesState } from './templates-state';

export interface TemplatesStoreState {
  state: TemplatesState;
  updateTemplateRefs: (refs: TemplateReference[]) => void;
  selectTemplate: (ref: TemplateReference | null) => void;
  updateTemplate: (template: Template) => void;
  updateTemplates: (templates: Template[]) => void;
  setIsCreating: (value: boolean) => void;
  setMappingSearchText: (value: string) => void;
  setMappingColorVariableFilter: (values: ColorVariableKey[]) => void;
  setMappingContrastVariableFilter: (values: ContrastVariableKey[]) => void;
  setMappingTokenGroupSelection: (value: string) => void;
  setVariablesSearchText: (value: string) => void;
  setAddGroupName: (value: string) => void;
  setAddVariableName: (value: string) => void;
}

export function getCurrentTemplate(storeState: TemplatesStoreState): Template | null {
  const selectedRef = storeState.state.selectedRef;
  if (!selectedRef) return null;
  const template = storeState.state.templates[selectedRef.name]?.[selectedRef.version];
  if (!template || !template.isLoaded) return null;
  return template.template;
}

export function getCurrentTemplateRefs(templateMap: TemplateMap): TemplateReference[] {
  const refs: TemplateReference[] = [];
  for (const name of Object.keys(templateMap).sort()) {
    for (const version of Object.keys(templateMap[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

export function getAllLoadedTemplates(storeState: TemplatesStoreState): Template[] {
  const templates: Template[] = [];
  for (const name of Object.keys(storeState.state.templates)) {
    for (const version of Object.keys(storeState.state.templates[name]!)) {
      const entry = storeState.state.templates[name]![version];
      if (entry && entry.isLoaded && entry.template) {
        templates.push(entry.template as Template);
      }
    }
  }
  return templates;
}

@singleton()
export class TemplatesStore {
  private store = createStore<TemplatesStoreState>()(
    immer((set): TemplatesStoreState => ({
      state: initialTemplatesState,
      updateTemplateRefs: (refs: TemplateReference[]) =>
        set((storeState) => {
          refs.forEach((ref) => {
            if (!storeState.state.templates[ref.name]) {
              storeState.state.templates[ref.name] = {};
            }
            if (!storeState.state.templates[ref.name][ref.version]) {
              storeState.state.templates[ref.name][ref.version] = {
                isLoaded: false,
                template: null,
              };
            }
          });
        }),
      selectTemplate: (ref: TemplateReference | null) =>
        set((storeState) => {
          storeState.state.selectedRef = ref;
        }),
      updateTemplate: (template: Template) =>
        set((storeState) => {
          if (!storeState.state.templates[template.name]) {
            storeState.state.templates[template.name] = {};
          }
          storeState.state.templates[template.name][template.version] = {
            isLoaded: true,
            template: castDraft(template),
          };
        }),
      updateTemplates: (templates: Template[]) =>
        set((storeState) => {
          templates.forEach((template) => {
            if (!storeState.state.templates[template.name]) {
              storeState.state.templates[template.name] = {};
            }
            storeState.state.templates[template.name][template.version] = {
              isLoaded: true,
              template: castDraft(template),
            };
          });
        }),
      setIsCreating: (value: boolean) =>
        set((storeState) => {
          storeState.state.isCreating = value;
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

  get api() {
    return this.store;
  }

  getStore(): TemplatesStoreState {
    return this.store.getState();
  }
}
