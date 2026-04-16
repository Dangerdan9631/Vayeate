import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateIsCreatingOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(value: boolean): void {
    this.templatesStore.getStore().setIsCreating(value);
  }
}
