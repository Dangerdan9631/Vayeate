import { singleton } from 'tsyringe';
import { SetTemplateAddVariableName } from '../../../operations/template-operations';

/** Store draft value for the "add variable" name input. */
@singleton()
export class SetTemplateAddVariableNameController {
  constructor(private readonly setTemplateAddVariableName: SetTemplateAddVariableName) {}

  run(value: string): void {
    this.setTemplateAddVariableName.execute(value);
  }
}
