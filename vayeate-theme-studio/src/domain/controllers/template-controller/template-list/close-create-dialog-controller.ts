import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../operations/template-operations';

/** Close create dialog and clear form (V2: CANCEL_BUTTON). */
@singleton()
export class CloseCreateDialogController {
  constructor(private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation) {}

  run(): void {
    this.setTemplateCreateDialogOpen.execute(false);
  }
}
