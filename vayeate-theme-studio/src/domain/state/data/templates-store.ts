import { castDraft } from 'immer';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schema/template-schemas';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { initialTemplatesState, type TemplateMap, type TemplatesState } from './templates-state';

/**
 * Templates cache snapshot plus mutation methods exposed from the store.
 */
export interface TemplatesStoreState {
  state: TemplatesState;
  updateTemplateRefs: (refs: TemplateReference[]) => void;
  updateTemplate: (template: Template) => void;
  updateTemplates: (templates: Template[]) => void;
}

/**
 * Resolves the loaded template for the selected reference, if any.
 *
 * @param templateMap Templates grouped by name and version.
 * @param selectedRef Currently selected template reference, or null.
 * @returns The loaded template, or null when none is selected or loaded.
 */
export function getCurrentTemplate(templateMap: TemplateMap, selectedRef: TemplateReference | null): Template | null {
  if (!selectedRef) return null;
  const template = templateMap[selectedRef.name]?.[selectedRef.version];
  if (!template || !template.isLoaded) return null;
  return template.template;
}

/**
 * Collects sorted template references from every entry in the template map.
 *
 * @param templateMap Templates grouped by name and version.
 * @returns Stable-sorted list of name/version pairs present in the map.
 */
export function getCurrentTemplateRefs(templateMap: TemplateMap): TemplateReference[] {
  const refs: TemplateReference[] = [];
  for (const name of Object.keys(templateMap).sort()) {
    for (const version of Object.keys(templateMap[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

/**
 * Returns every template that is currently loaded across all name/version slots.
 *
 * @param templateMap Templates grouped by name and version.
 * @returns All loaded template entities in map iteration order.
 */
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

/**
 * Zustand store for the in-memory template entity cache.
 */
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

  /**
   * Zustand store API for React subscriptions via viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current snapshot and mutation methods for domain operations.
   * @returns Live templates store state and setters.
   */
  getStore(): TemplatesStoreState {
    return this.store.getState();
  }
}
