import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(catalog: Catalog | null): void {
    if (catalog) {
      this.catalogsStore.getStore().updateCatalog(catalog);
    }
  }
}



