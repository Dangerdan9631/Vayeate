import { singleton } from 'tsyringe';
import { SetTemplateCreateFormNameOperation } from '../../../../domain/operations/template-operations/template-list/set-template-create-form-name-operation';

/**
 * Handles TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE by updating the form name.
 */
@singleton()
export class SetCreateFormNameController {
  constructor(private readonly setTemplateCreateFormName: SetTemplateCreateFormNameOperation) {}

  /**
   * Stores the in-progress template name in create-dialog UI state.
   * @param value Text entered in the create dialog name field.
   * @returns Nothing; state updates happen in domain operations.
   */
  run(value: string): void {
    this.setTemplateCreateFormName.execute(value);
  }
}
