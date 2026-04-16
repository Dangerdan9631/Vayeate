import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateVariablesSearchTextOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(value: string): void {
    this.templatesStore.getStore().setVariablesSearchText(value);
  }
}

