import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class OpenCatalogCreateDialogOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(): void {
    this.catalogsStore.getStore().setCreateDialogOpen(true);
  }
}
