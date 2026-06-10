import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schema/template-schemas';
import { TemplatesStore } from '../../state/data/templates-store';
import { TemplateUiStore } from '../../state/ui/template-ui-store';
import { SaveTemplateOperation } from '../template-operations/template-details/save-template-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../template-operations/template-list/refresh-template-refs-and-select-operation';

/** Applies a template snapshot through the standard persist and selection path (undo/redo). */
@singleton()
export class ApplyTemplateUndoStateOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  execute(template: Template): void {
    this.templatesStore.getStore().updateTemplate(template);
    this.templateUiStore.getStore().selectTemplate({ name: template.name, version: template.version });
    this.saveTemplate.execute(template);
    this.refreshTemplateRefsAndSelect.execute(template.name, template.version, template);
  }
}
