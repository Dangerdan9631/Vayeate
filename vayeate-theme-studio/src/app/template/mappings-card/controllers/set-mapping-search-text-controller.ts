import { singleton } from 'tsyringe';
import { SetTemplateMappingSearchTextOperation } from '../../../../domain/operations/template-operations/mappings/set-template-mapping-search-text-operation';

/**
 * Handles TEMPLATE_MAPPING_SEARCH_TEXT_ON_CHANGE by updating the mappings search filter.
 */
@singleton()
export class SetMappingSearchTextController {
  constructor(private readonly setTemplateMappingSearchText: SetTemplateMappingSearchTextOperation) {}

  /**
   * Stores the mappings card search text in template UI state.
   * @param value Text entered in the mappings search field.
   * @returns Nothing; state updates happen in domain operations.
   */
  run(value: string): void {
    this.setTemplateMappingSearchText.execute(value);
  }
}
