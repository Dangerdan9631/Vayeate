import { singleton } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../state/create-dialog/create-template-dialog-store';

@singleton()
export class SetTemplateCreateDialogOpenOperation {
  constructor(private readonly createTemplateDialogStore: CreateTemplateDialogStore) {}

  execute(value: boolean): void {
    if (value) {
      this.createTemplateDialogStore.getStore().openCreateTemplateDialog();
    } else {
      this.createTemplateDialogStore.getStore().closeCreateTemplateDialog('CANCEL');
    }
  }
}
