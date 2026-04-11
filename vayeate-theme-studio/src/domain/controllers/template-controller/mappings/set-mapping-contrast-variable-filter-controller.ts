import type { ContrastVariableKey } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetTemplateMappingContrastVariableFilterOperation } from '../../../operations/template-operations/mappings/set-template-mapping-contrast-variable-filter-operation';

@singleton()
export class SetMappingContrastVariableFilterController {
  constructor(
    private readonly setTemplateMappingContrastVariableFilter: SetTemplateMappingContrastVariableFilterOperation,
  ) {}

  run(values: ContrastVariableKey[]): void {
    this.setTemplateMappingContrastVariableFilter.execute(values);
  }
}
