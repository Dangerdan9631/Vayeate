import { injectable } from 'tsyringe';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

/** Store draft value for the "add variable" name input. */
@injectable()
export class SetTemplateAddVariableNameOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(value: string): void {
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE_ADD_VARIABLE_NAME', value });
  }
}

