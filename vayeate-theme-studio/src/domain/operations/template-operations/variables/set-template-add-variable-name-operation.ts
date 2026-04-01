import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';

/** Store draft value for the "add variable" name input. */
@injectable()
export class SetTemplateAddVariableNameOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_TEMPLATE_ADD_VARIABLE_NAME', value });
  }
}

