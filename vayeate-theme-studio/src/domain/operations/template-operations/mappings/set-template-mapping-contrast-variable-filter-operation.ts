import { injectable } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetTemplateMappingContrastVariableFilterOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(values: ContrastVariableKey[]): void {
    this.appStateSetter.apply({ type: 'SET_TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER', values });
  }
}



