import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetTemplateMappingColorVariableFilterOperation } from '../../../../domain/operations/template-operations/mappings/set-template-mapping-color-variable-filter-operation';

/**
 * Handles TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER_LIST_ON_SELECT by updating the color filter.
 */
@singleton()
export class SetMappingColorVariableFilterController {
  constructor(
    private readonly setTemplateMappingColorVariableFilter: SetTemplateMappingColorVariableFilterOperation,
  ) {}

  /**
   * Stores selected color variable keys used to filter mapping rows.
   * @param values Color variable keys chosen in the filter list.
   * @returns Nothing; state updates happen in domain operations.
   */
  run(values: ColorVariableKey[]): void {
    this.setTemplateMappingColorVariableFilter.execute(values);
  }
}
