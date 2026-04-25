import { singleton } from 'tsyringe';
import { SetTemplateAddVariableNameOperation } from '../../../../domain/operations/template-operations/variables/set-template-add-variable-name-operation';

/** Store draft value for the "add variable" name input. */
@singleton()
export class SetTemplateAddVariableNameController {
  constructor(private readonly setTemplateAddVariableName: SetTemplateAddVariableNameOperation) {}

  run(value: string): void {
    this.setTemplateAddVariableName.execute(value);
  }
}
