import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

@singleton()
export class SetTemplateMappingSearchTextOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(value: string): void {
    this.templatesStore.getStore().setMappingSearchText(value);
  }
}

