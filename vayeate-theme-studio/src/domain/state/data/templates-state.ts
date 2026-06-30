import type { Template } from '../../../model/schema/template-schemas';

/**
 * Load status and optional template payload for one version slot.
 */
export interface TemplateState {
  isLoaded: boolean;
  template: Template | null;
}

/**
 * Template versions keyed by version string for a single template name.
 */
export interface TemplateVersions {
  [version: string]: TemplateState;
}

/**
 * All template names mapped to their version entries.
 */
export interface TemplateMap {
  [name: string]: TemplateVersions;
}

/**
 * In-memory cache of template entities indexed by name and version.
 */
export interface TemplatesState {
  templates: TemplateMap;
}

/**
 * Empty templates cache before templates are discovered or loaded.
 */
export const initialTemplatesState: TemplatesState = {
  templates: {},
};
