import { singleton } from 'tsyringe';
import { SetTemplateAddVariableNameOperation } from '../../../../domain/operations/template-operations/variables/set-template-add-variable-name-operation';

/**
 * Handles TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE by updating the add-variable input.
 */
@singleton()
export class SetTemplateAddVariableNameController {
  constructor(private readonly setTemplateAddVariableName: SetTemplateAddVariableNameOperation) {}

  /**
   * Stores the in-progress variable name in template UI state.
   * @param value Text entered in the add-variable name field.
   * @returns Nothing; state updates happen in domain operations.
   */
  run(value: string): void {
    this.setTemplateAddVariableName.execute(value);
  }
}
