import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogBulkAddDialogOpenOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(value: boolean): void {
    this.catalogsStore.getStore().setBulkAddDialogOpen(value);
  }
}

