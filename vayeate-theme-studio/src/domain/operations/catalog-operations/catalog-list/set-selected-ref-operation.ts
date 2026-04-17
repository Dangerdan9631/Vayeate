import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetSelectedRefOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(ref: CatalogReference | null): void {
    this.catalogsStore.getStore().setSelectedRef(ref);
  }
}



