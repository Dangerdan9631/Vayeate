import { singleton } from 'tsyringe';
import { SetTemplateVariablesSearchTextOperation } from '../../../../domain/operations/template-operations/variables/set-template-variables-search-text-operation';

/**
 * Handles TEMPLATE_VARIABLES_SEARCH_TEXT_ON_CHANGE by updating the variables search filter.
 */
@singleton()
export class SetVariablesSearchTextController {
  constructor(private readonly setTemplateVariablesSearchText: SetTemplateVariablesSearchTextOperation) {}

  /**
   * Stores the variables card search text in template UI state.
   * @param value Text entered in the variables search field.
   * @returns Nothing; state updates happen in domain operations.
   */
  run(value: string): void {
    this.setTemplateVariablesSearchText.execute(value);
  }
}
