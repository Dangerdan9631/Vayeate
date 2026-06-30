import type { ContrastVariableKey } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetTemplateMappingContrastVariableFilterOperation } from '../../../../domain/operations/template-operations/mappings/set-template-mapping-contrast-variable-filter-operation';

/**
 * Handles TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER_LIST_ON_SELECT by updating the contrast filter.
 */
@singleton()
export class SetMappingContrastVariableFilterController {
  constructor(
    private readonly setTemplateMappingContrastVariableFilter: SetTemplateMappingContrastVariableFilterOperation,
  ) {}

  /**
   * Stores selected contrast variable keys used to filter mapping rows.
   * @param values Contrast variable keys chosen in the filter list.
   * @returns Nothing; state updates happen in domain operations.
   */
  run(values: ContrastVariableKey[]): void {
    this.setTemplateMappingContrastVariableFilter.execute(values);
  }
}
