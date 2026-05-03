import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(template: Template | null): void {
    if (!template) {
      this.templatesStore.getStore().selectTemplate(null);
      return;
    }
    this.templatesStore.getStore().updateTemplate(template);
  }
}



