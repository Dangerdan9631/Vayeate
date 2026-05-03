import { singleton } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../state/create-dialog/create-template-dialog-store';

@singleton()
export class SetTemplateIsCreatingOperation {
  constructor(private readonly createTemplateDialogStore: CreateTemplateDialogStore) {}

  execute(value: boolean): void {
    this.createTemplateDialogStore.getStore().setIsCreating(value);
  }
}
