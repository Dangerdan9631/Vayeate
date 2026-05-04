import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../../domain/operations/template-operations/template-list/set-template-create-dialog-open-operation';

@singleton()
export class CloseCreateDialogController {
  constructor(private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation) {}

  run(): void {
    this.setTemplateCreateDialogOpen.execute(false);
  }
}
