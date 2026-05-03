import { singleton } from 'tsyringe';
import { BulkAddDialogStore } from '../../../state/ui/bulk-add-dialog-store';

@singleton()
export class SetCatalogBulkAddDialogOpenOperation {
  constructor(private readonly bulkAddDialogStore: BulkAddDialogStore) {}

  execute(value: boolean): void {
    if (value) {
      this.bulkAddDialogStore.getStore().openBulkAddDialog();
    } else {
      this.bulkAddDialogStore.getStore().closeBulkAddDialog('CANCEL');
    }
  }
}

