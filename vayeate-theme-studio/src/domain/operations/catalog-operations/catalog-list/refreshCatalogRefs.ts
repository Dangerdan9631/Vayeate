import { injectable } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { StoreStateSetter } from '../../../state/store-state-setter';

/** List catalogs and set entries in store. Single responsibility: refresh ref list. */
@injectable()
export class RefreshCatalogRefs {
  constructor(
    private readonly storeStateSetter: StoreStateSetter,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(): Promise<CatalogReference[]> {
    const refs = await this.catalogGateway.listCatalogs();
    this.storeStateSetter.apply({
      type: 'SET_STORE_CATALOG_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
    });
    return refs;
  }
}


