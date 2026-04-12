import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../operations/template-operations/template-list/set-template-create-dialog-open-operation';

/** Close create dialog and clear form (V2: CANCEL_BUTTON). */
@singleton()
export class CloseCreateDialogController {
  constructor(private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation) {}

  async run(): Promise<void> {
    this.setTemplateCreateDialogOpen.execute(false);
  }
}
