import type { Template } from '../../../model/schema/template-schemas';

export interface TemplateState {
  isLoaded: boolean;
  template: Template | null;
}

export interface TemplateVersions {
  [version: string]: TemplateState;
}

export interface TemplateMap {
  [name: string]: TemplateVersions;
}

export interface TemplatesState {
  templates: TemplateMap;
}

export const initialTemplatesState: TemplatesState = {
  templates: {},
};
