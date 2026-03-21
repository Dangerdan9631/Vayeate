import { singleton } from 'tsyringe';
import { CloseTemplateCreateDialogController } from '../template-details/closeTemplateCreateDialog';

/** Close create dialog and clear form (V2: CANCEL_BUTTON). */
@singleton()
export class CloseCreateDialogController {
  constructor(private readonly closeTemplateCreateDialog: CloseTemplateCreateDialogController) {}

  run(): void {
    this.closeTemplateCreateDialog.run();
  }
}
