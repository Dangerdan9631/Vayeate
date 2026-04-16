import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';

/** Store draft value for the "add variable" name input. */
@singleton()
export class SetTemplateAddVariableNameOperation {
  constructor(private readonly templatesStore: TemplatesStore) {}

  execute(value: string): void {
    this.templatesStore.getStore().setAddVariableName(value);
  }
}

