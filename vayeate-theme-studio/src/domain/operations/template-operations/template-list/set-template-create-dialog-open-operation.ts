import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateCreateDialogOpenOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(value: boolean): void {
    this.templatesStore.getStore().setCreateDialogOpen(value);
  }
}
