import { injectable } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schemas';
import { TemplatesStateSetter } from '../../../state/template/templates-state-reducer';

@injectable()
export class SetTemplateMappingContrastVariableFilterOperation {
  constructor(private readonly TemplatesStateSetter: TemplatesStateSetter) {}

  execute(values: ContrastVariableKey[]): void {
    this.TemplatesStateSetter.apply({ type: 'SET_TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER', values });
  }
}



