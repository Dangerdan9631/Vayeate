import type { Template } from '../model/schemas.js';

const TAG = '[TemplateController]';

export interface CreateTemplateParams {
  name: string;
}

export function createTemplateWithParams(params: CreateTemplateParams): Template {
  console.debug(TAG, 'createTemplateWithParams', params.name);
  return {
    name: params.name,
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings: [],
    colorVariables: [],
    contrastVariables: [],
    groups: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };
}
