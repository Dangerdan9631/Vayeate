import type { Template } from '../../../model/schema/template-schemas';

export interface TemplatePaneState {
  template: Template | null;
  undoMetadata?: { deleteVersionOnRestore?: Pick<Template, 'name' | 'version'> };
}

export interface RestoreTemplateStateParams {
  template?: Template | null;
  deleteTemplateVersionOnRestore?: Pick<Template, 'name' | 'version'>;
}

export type TemplateUndoPush = (label: string, prev: TemplatePaneState, next: TemplatePaneState) => void;
