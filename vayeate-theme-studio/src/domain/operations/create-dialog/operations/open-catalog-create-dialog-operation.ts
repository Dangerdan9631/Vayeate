import { singleton } from 'tsyringe';
import { CreateCatalogDialogStore } from '../../../state/ui/create-catalog-dialog-store';

/**
 * Opens catalog create dialog in the UI store.
 */

@singleton()
export class OpenCatalogCreateDialogOperation {
  constructor(private readonly createCatalogDialogStore: CreateCatalogDialogStore) {}

  /**
   * Runs the open catalog create dialog mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.createCatalogDialogStore.getStore().openCreateCatalogDialog();
  }
}
