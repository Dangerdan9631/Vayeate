import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../operations/template-operations/template-list/set-template-create-dialog-open-operation';

@singleton()
export class OpenTemplateCreateDialogController {
  constructor(private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation) {}

  run(): void {
    this.setTemplateCreateDialogOpen.execute(true);
  }
}
