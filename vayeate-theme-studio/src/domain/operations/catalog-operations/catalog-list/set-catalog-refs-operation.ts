import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogRefsOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(refs: CatalogReference[]): void {
    this.catalogsStore.getStore().updateCatalogRefs(refs);
  }
}


