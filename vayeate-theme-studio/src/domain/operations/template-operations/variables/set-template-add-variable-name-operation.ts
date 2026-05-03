import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';

/** Store draft value for the "add variable" name input. */
@singleton()
export class SetTemplateAddVariableNameOperation {
  constructor(private readonly templateUiStore: TemplateUiStore) {}

  execute(value: string): void {
    this.templateUiStore.getStore().setAddVariableName(value);
  }
}

