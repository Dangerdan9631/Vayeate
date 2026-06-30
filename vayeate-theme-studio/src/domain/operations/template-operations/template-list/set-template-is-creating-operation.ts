import { singleton } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../state/ui/create-template-dialog-store';

/**
 * Updates template is creating in the domain or UI store.
 */

@singleton()
export class SetTemplateIsCreatingOperation {
  constructor(private readonly createTemplateDialogStore: CreateTemplateDialogStore) {}

  /**
   * Runs the set template is creating mutation.
   * @param value Value (boolean).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: boolean): void {
    this.createTemplateDialogStore.getStore().setIsCreating(value);
  }
}
