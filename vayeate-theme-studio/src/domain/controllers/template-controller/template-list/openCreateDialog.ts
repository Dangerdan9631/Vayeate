import { singleton } from 'tsyringe';
import { OpenTemplateCreateDialogController } from '../template-details/openTemplateCreateDialog';

/** Open create dialog and reset form (V2: CREATE_BUTTON or CREATE_DIALOG_ON_OPEN). */
@singleton()
export class OpenCreateDialogController {
  constructor(private readonly openTemplateCreateDialog: OpenTemplateCreateDialogController) {}

  run(): void {
    this.openTemplateCreateDialog.run();
  }
}
