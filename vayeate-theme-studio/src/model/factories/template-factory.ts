import type { Template } from '../schema/template-schemas';

/**
 * User-supplied fields required to construct a new template draft.
 */
export interface CreateTemplateParams {
  name: string;
}

/**
 * Builds a new template with default empty catalogs, mappings, and variables.
 *
 * @param params - Creation input; only the display name is required.
 * @returns A template at version `1.0.0`, unlocked, with empty collections.
 */
export function createTemplateWithParams(params: CreateTemplateParams): Template {
  return {
    name: params.name,
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings: [],
    colorVariables: [],
    contrastVariables: [],
    styleVariables: [],
    groups: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };
}
