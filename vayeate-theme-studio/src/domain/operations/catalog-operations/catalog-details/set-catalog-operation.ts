import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(catalog: Catalog | null): void {
    this.catalogsStore.getStore().setCatalog(catalog);
  }
}



