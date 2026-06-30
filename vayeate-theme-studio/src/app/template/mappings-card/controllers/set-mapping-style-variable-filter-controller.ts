import type { StyleVariableKey } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetTemplateMappingStyleVariableFilterOperation } from '../../../../domain/operations/template-operations/mappings/set-template-mapping-style-variable-filter-operation';

/**
 * Handles TEMPLATE_MAPPING_STYLE_VARIABLE_FILTER_LIST_ON_SELECT by updating the style filter.
 */
@singleton()
export class SetMappingStyleVariableFilterController {
  constructor(
    private readonly setTemplateMappingStyleVariableFilter: SetTemplateMappingStyleVariableFilterOperation,
  ) {}

  /**
   * Stores selected style variable keys used to filter mapping rows.
   * @param values Style variable keys chosen in the filter list.
   */
  run(values: StyleVariableKey[]): void {
    this.setTemplateMappingStyleVariableFilter.execute(values);
  }
}
