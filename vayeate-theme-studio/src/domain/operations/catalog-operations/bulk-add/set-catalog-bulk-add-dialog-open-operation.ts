import { singleton } from 'tsyringe';
import { BulkAddDialogStore } from '../../../state/ui/bulk-add-dialog-store';

/**
 * Updates catalog bulk add dialog open in the domain or UI store.
 */

@singleton()
export class SetCatalogBulkAddDialogOpenOperation {
  constructor(private readonly bulkAddDialogStore: BulkAddDialogStore) {}

  /**
   * Runs the set catalog bulk add dialog open mutation.
   * @param value Value (boolean).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: boolean): void {
    if (value) {
      this.bulkAddDialogStore.getStore().openBulkAddDialog();
    } else {
      this.bulkAddDialogStore.getStore().closeBulkAddDialog('CANCEL');
    }
  }
}

