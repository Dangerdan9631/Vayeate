import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateCreateFormNameOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(value: string): void {
    this.templatesStore.getStore().setCreateFormName(value);
  }
}

