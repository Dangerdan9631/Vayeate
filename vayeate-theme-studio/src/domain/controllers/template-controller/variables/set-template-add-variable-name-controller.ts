import { singleton } from 'tsyringe';
import { SetTemplateAddVariableNameOperation } from '../../../operations/template-operations';

/** Store draft value for the "add variable" name input. */
@singleton()
export class SetTemplateAddVariableNameController {
  constructor(private readonly setTemplateAddVariableName: SetTemplateAddVariableNameOperation) {}

  run(value: string): void {
    this.setTemplateAddVariableName.execute(value);
  }
}
