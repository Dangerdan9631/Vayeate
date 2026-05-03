import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

@singleton()
export class SetTemplateVariablesSearchTextOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(value: string): void {
    this.templateUiStore.getStore().setVariablesSearchText(value);
  }
}

