import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogBulkAddDialogOpenOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(value: boolean): void {
    if (value) {
      this.catalogsStore.getStore().openBulkAddDialog();
    } else {
      this.catalogsStore.getStore().closeBulkAddDialog('CANCEL');
    }
  }
}

