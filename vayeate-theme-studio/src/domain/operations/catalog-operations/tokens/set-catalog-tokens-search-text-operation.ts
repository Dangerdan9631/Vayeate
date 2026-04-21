import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';

@singleton()
export class SetCatalogTokensSearchTextOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(value: string): void {
    this.catalogsStore.getStore().setTokensSearchText(value);
  }
}

