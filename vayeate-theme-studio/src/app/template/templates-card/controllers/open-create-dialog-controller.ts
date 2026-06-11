import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../../domain/operations/template-operations/template-list/set-template-create-dialog-open-operation';
import { SetTemplateCreateFormNameOperation } from '../../../../domain/operations/template-operations/template-list/set-template-create-form-name-operation';

/**
 * Handles TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK by opening the create dialog.
 */
@singleton()
export class OpenCreateDialogController {
  constructor(
    private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation,
    private readonly setTemplateCreateFormName: SetTemplateCreateFormNameOperation
  ) { }

  /**
   * Clears the create form and opens the create-template dialog.
   * @returns Nothing; dialog state updates happen in domain operations.
   */
  run(): void {
    this.setTemplateCreateFormName.execute("");
    this.setTemplateCreateDialogOpen.execute(true);
  }
}
