import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(template: Template | null): void {
    this.templatesStore.getStore().setTemplate(template);
  }
}



