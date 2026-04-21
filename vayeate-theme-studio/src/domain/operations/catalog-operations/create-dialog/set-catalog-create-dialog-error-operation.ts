import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';

@singleton()
export class SetCatalogCreateDialogErrorOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(errorMessage: string | null): void {
    this.catalogsStore.getStore().setCreateCatalogDialogError(errorMessage);
  }
}
