import { castDraft } from 'immer';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schema/template-schemas';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { initialTemplatesState, type TemplateMap, type TemplatesState } from './templates-state';

export interface TemplatesStoreState {
  state: TemplatesState;
  updateTemplateRefs: (refs: TemplateReference[]) => void;
  updateTemplate: (template: Template) => void;
  updateTemplates: (templates: Template[]) => void;
}

export function getCurrentTemplate(templateMap: TemplateMap, selectedRef: TemplateReference | null): Template | null {
  if (!selectedRef) return null;
  const template = templateMap[selectedRef.name]?.[selectedRef.version];
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

export function getAllLoadedTemplates(templateMap: TemplateMap): Template[] {
  const templates: Template[] = [];
  for (const name of Object.keys(templateMap)) {
    for (const version of Object.keys(templateMap[name]!)) {
      const entry = templateMap[name]![version];
      if (entry && entry.isLoaded && entry.template) {
        templates.push(entry.template as Template);
      }
    }
  }
  return templates;
}

function ensureTemplateRef(templateMap: TemplateMap, ref: TemplateReference): void {
  if (!templateMap[ref.name]) {
    templateMap[ref.name] = {};
  }

  if (!templateMap[ref.name][ref.version]) {
    templateMap[ref.name][ref.version] = {
      isLoaded: false,
      template: null,
    };
  }
}

function upsertTemplate(templateMap: TemplateMap, template: Template): void {
  const ref = {
    name: template.name,
    version: template.version,
  };
  ensureTemplateRef(templateMap, ref);
  templateMap[ref.name][ref.version] = {
    isLoaded: true,
    template: castDraft(template),
  };
}

@singleton()
export class TemplatesStore {
  private store = createStore<TemplatesStoreState>()(
    immer((set): TemplatesStoreState => ({
      state: initialTemplatesState,
      updateTemplateRefs: (refs: TemplateReference[]) =>
        set((storeState) => {
          refs.forEach((ref) => {
            ensureTemplateRef(storeState.state.templates, ref);
          });
        }),
      updateTemplate: (template: Template) =>
        set((storeState) => {
          upsertTemplate(storeState.state.templates, template);
        }),
      updateTemplates: (templates: Template[]) =>
        set((storeState) => {
          templates.forEach((template) => {
            upsertTemplate(storeState.state.templates, template);
          });
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
