import { injectable } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@injectable()
export class SetTemplateMappingColorVariableFilterOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(values: ColorVariableKey[]): void {
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER', values });
  }
}



