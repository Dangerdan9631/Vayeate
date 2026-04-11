import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@singleton()
export class SetCatalogRefsOperation {
  constructor(private readonly catalogsStateSetter: CatalogsStateSetter) {}

  execute(refs: CatalogReference[]): void {
    this.catalogsStateSetter.apply({
      type: 'SET_CATALOG_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
    });
  }
}


