import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogRefsOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(refs: CatalogReference[]): void {
    this.catalogsStore.getStore().setCatalogMapEntries(refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })));
  }
}


