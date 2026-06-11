import { singleton } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../state/ui/create-template-dialog-store';

/**
 * Updates template create dialog open in the domain or UI store.
 */

@singleton()
export class SetTemplateCreateDialogOpenOperation {
  constructor(private readonly createTemplateDialogStore: CreateTemplateDialogStore) {}

  /**
   * Runs the set template create dialog open mutation.
   * @param value Value (boolean).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: boolean): void {
    if (value) {
      this.createTemplateDialogStore.getStore().openCreateTemplateDialog();
    } else {
      this.createTemplateDialogStore.getStore().closeCreateTemplateDialog('CANCEL');
    }
  }
}
