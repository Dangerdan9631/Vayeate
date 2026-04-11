import type { ColorVariableKey } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetTemplateMappingColorVariableFilterOperation } from '../../../operations/template-operations/mappings/set-template-mapping-color-variable-filter-operation';

@singleton()
export class SetMappingColorVariableFilterController {
  constructor(
    private readonly setTemplateMappingColorVariableFilter: SetTemplateMappingColorVariableFilterOperation,
  ) {}

  run(values: ColorVariableKey[]): void {
    this.setTemplateMappingColorVariableFilter.execute(values);
  }
}
