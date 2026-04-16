import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class CloseCatalogCreateDialogOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(): void {
    this.catalogsStore.getStore().setCreateDialogOpen(false);
  }
}
