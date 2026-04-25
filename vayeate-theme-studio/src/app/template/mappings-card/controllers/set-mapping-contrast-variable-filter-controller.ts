import type { ContrastVariableKey } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetTemplateMappingContrastVariableFilterOperation } from '../../../../domain/operations/template-operations/mappings/set-template-mapping-contrast-variable-filter-operation';

@singleton()
export class SetMappingContrastVariableFilterController {
  constructor(
    private readonly setTemplateMappingContrastVariableFilter: SetTemplateMappingContrastVariableFilterOperation,
  ) {}

  run(values: ContrastVariableKey[]): void {
    this.setTemplateMappingContrastVariableFilter.execute(values);
  }
}
