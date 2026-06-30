import { singleton } from 'tsyringe';
import { SetTemplateAddVariableNameOperation } from '../../../../domain/operations/template-operations/variables/set-template-add-variable-name-operation';
import type { TemplateVariableKind } from '../../../../model/template-variable-kind';

/**
 * Handles TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE by updating the add-variable input.
 */
@singleton()
export class SetTemplateAddVariableNameController {
  constructor(private readonly setTemplateAddVariableName: SetTemplateAddVariableNameOperation) {}

  /**
   * Stores the in-progress variable name in template UI state.
   * @param variableKind Variable kind for the targeted add input.
   * @param groupRef Group ref for the targeted add input.
   * @param value Text entered in the add-variable name field.
   * @returns Nothing; state updates happen in domain operations.
   */
  run(variableKind: TemplateVariableKind, groupRef: string | null, value: string): void {
    this.setTemplateAddVariableName.execute(variableKind, groupRef, value);
  }
}
