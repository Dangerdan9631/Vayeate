import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogNewTokenKeyOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(value: string): void {
    this.catalogsStore.getStore().setNewTokenKey(value);
  }
}

