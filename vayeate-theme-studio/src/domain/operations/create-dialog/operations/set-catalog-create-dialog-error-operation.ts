import { singleton } from 'tsyringe';
import { CreateCatalogDialogStore } from '../../../state/ui/create-catalog-dialog-store';

/**
 * Updates catalog create dialog error in the domain or UI store.
 */

@singleton()
export class SetCatalogCreateDialogErrorOperation {
  constructor(private readonly createCatalogDialogStore: CreateCatalogDialogStore) {}

  /**
   * Runs the set catalog create dialog error mutation.
   * @param errorMessage Error message (string | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(errorMessage: string | null): void {
    this.createCatalogDialogStore.getStore().setCreateCatalogDialogError(errorMessage);
  }
}
