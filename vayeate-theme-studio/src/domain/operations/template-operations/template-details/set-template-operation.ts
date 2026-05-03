import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

@singleton()
export class SetTemplateOperation {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
  ) {}

  execute(template: Template | null): void {
    if (!template) {
      this.templateUiStore.getStore().selectTemplate(null);
      return;
    }
    this.templatesStore.getStore().updateTemplate(template);
  }
}



