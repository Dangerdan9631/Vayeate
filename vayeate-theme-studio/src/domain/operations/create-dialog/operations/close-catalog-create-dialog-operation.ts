import { singleton } from 'tsyringe';
import { CreateCatalogDialogStore } from '../../../state/ui/create-catalog-dialog-store';
import { DialogResultOkCancel } from '../../../../model/dialog-result';

/**
 * Closes catalog create dialog in the UI store.
 */

@singleton()
export class CloseCatalogCreateDialogOperation {
  constructor(private readonly createCatalogDialogStore: CreateCatalogDialogStore) {}

  /**
   * Runs the close catalog create dialog mutation.
   * @param result Result (DialogResultOkCancel).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(result: DialogResultOkCancel): void {
    this.createCatalogDialogStore.getStore().closeCreateCatalogDialog(result);
  }
}
