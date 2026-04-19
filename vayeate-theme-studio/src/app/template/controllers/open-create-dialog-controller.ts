import { singleton } from 'tsyringe';
import { SetTemplateCreateDialogOpenOperation } from '../../../domain/operations/template-operations/template-list/set-template-create-dialog-open-operation';
import { SetTemplateCreateFormNameOperation } from '../../../domain/operations/template-operations/template-list/set-template-create-form-name-operation';

@singleton()
export class OpenCreateDialogController {
  constructor(
    private readonly setTemplateCreateDialogOpen: SetTemplateCreateDialogOpenOperation,
    private readonly setTemplateCreateFormName: SetTemplateCreateFormNameOperation
  ) { }

  run(): void {
    this.setTemplateCreateFormName.execute("");
    this.setTemplateCreateDialogOpen.execute(true);
  }
}
