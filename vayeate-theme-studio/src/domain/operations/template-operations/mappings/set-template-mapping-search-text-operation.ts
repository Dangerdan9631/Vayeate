import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

@singleton()
export class SetTemplateMappingSearchTextOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(value: string): void {
    this.templateUiStore.getStore().setMappingSearchText(value);
  }
}

