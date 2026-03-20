import type { Template } from '../schemas';

export interface CreateTemplateParams {
  name: string;
}

export function createTemplateWithParams(params: CreateTemplateParams): Template {
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
