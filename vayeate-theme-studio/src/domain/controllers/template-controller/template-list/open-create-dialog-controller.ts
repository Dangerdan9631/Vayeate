import { singleton } from 'tsyringe';
import { OpenTemplateCreateDialogController } from '../template-details/open-template-create-dialog-controller';

/** Open create dialog and reset form (V2: CREATE_BUTTON or CREATE_DIALOG_ON_OPEN). */
@singleton()
export class OpenCreateDialogController {
  constructor(private readonly openTemplateCreateDialog: OpenTemplateCreateDialogController) {}

  run(): void {
    this.openTemplateCreateDialog.run();
  }
}
