import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetTemplateMappingColorVariableFilterOperation } from '../../../operations/template-operations/mappings/set-template-mapping-color-variable-filter-operation';

@singleton()
export class SetMappingColorVariableFilterController {
  constructor(
    private readonly setTemplateMappingColorVariableFilter: SetTemplateMappingColorVariableFilterOperation,
  ) {}

  async run(values: ColorVariableKey[]): Promise<void> {
    this.setTemplateMappingColorVariableFilter.execute(values);
  }
}
