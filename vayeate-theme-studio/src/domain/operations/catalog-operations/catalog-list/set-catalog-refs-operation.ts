import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';

@singleton()
export class SetCatalogRefsOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(refs: CatalogReference[]): void {
    this.catalogsStore.getStore().updateCatalogRefs(refs);
  }
}


