import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../operations/template-operations/template-list/set-template-create-dialog-open-operation';

/** Open create dialog and reset form (V2: CREATE_BUTTON or CREATE_DIALOG_ON_OPEN). */
@singleton()
export class OpenCreateDialogController {
  constructor(private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation) {}

  run(): void {
    this.setTemplateCreateDialogOpen.execute(true);
  }
}
