import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../../domain/operations/template-operations/template-list/set-template-create-dialog-open-operation';

/**
 * Handles TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK by closing the dialog.
 */
@singleton()
export class CloseCreateDialogController {
  constructor(private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation) {}

  /**
   * Closes the create-template dialog without persisting changes.
   * @returns Nothing; dialog state updates happen in domain operations.
   */
  run(): void {
    this.setTemplateCreateDialogOpen.execute(false);
  }
}
