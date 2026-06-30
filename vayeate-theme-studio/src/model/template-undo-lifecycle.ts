import type { Template } from './schema/template-schemas';
import type { TemplateReference } from './schema/theme-schemas';

/**
 * Template presence plus UI selection for create/delete undo diffs.
 */
export interface TemplateLifecycleUndoSnapshot {
  template: Template | null;
  selectedRef: TemplateReference | null;
}
