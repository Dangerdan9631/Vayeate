import { singleton } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../state/ui/create-template-dialog-store';

@singleton()
export class SetTemplateCreateFormNameOperation {
  constructor(private readonly createTemplateDialogStore: CreateTemplateDialogStore) {}

  execute(value: string): void {
    this.createTemplateDialogStore.getStore().setCreateTemplateDialogData(value);
  }
}

