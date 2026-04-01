import { injectable } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetTemplateMappingColorVariableFilterOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(values: ColorVariableKey[]): void {
    this.appStateSetter.apply({ type: 'SET_TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER', values });
  }
}



