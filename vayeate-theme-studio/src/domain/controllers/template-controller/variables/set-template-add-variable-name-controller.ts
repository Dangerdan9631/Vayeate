import { singleton } from 'tsyringe';
import { SetTemplateAddVariableNameOperation } from '../../../operations/template-operations/variables/set-template-add-variable-name-operation';

/** Store draft value for the "add variable" name input. */
@singleton()
export class SetTemplateAddVariableNameController {
  constructor(private readonly setTemplateAddVariableName: SetTemplateAddVariableNameOperation) {}

  async run(value: string): Promise<void> {
    this.setTemplateAddVariableName.execute(value);
  }
}
