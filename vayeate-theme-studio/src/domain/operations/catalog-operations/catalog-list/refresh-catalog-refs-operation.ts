import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

/** List catalogs and set entries in store. Single responsibility: refresh ref list. */
@singleton()
export class RefreshCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(): Promise<CatalogReference[]> {
    const refs = await this.catalogGateway.listCatalogs();
    this.catalogsStore.getStore().setCatalogMapEntries(refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })));
    return refs;
  }
}


