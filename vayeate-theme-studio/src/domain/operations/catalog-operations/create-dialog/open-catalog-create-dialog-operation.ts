import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';

@singleton()
export class OpenCatalogCreateDialogOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(): void {
    this.catalogsStore.getStore().openCreateCatalogDialog();
  }
}
