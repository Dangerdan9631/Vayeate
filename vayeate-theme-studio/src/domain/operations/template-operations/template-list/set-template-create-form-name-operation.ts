import { singleton } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../state/ui/create-template-dialog-store';

/**
 * Updates template create form name in the domain or UI store.
 */

@singleton()
export class SetTemplateCreateFormNameOperation {
  constructor(private readonly createTemplateDialogStore: CreateTemplateDialogStore) {}

  /**
   * Runs the set template create form name mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.createTemplateDialogStore.getStore().setCreateTemplateDialogData(value);
  }
}

