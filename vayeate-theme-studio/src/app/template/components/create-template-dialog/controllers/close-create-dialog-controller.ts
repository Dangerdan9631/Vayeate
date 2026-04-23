import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../../../domain/operations/template-operations/template-list/set-template-create-dialog-open-operation';

/** Close create dialog and clear form (V2: CANCEL_BUTTON). */
@singleton()
export class CloseCreateDialogController {
  constructor(private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation) {}

  run(): void {
    this.setTemplateCreateDialogOpen.execute(false);
  }
}
