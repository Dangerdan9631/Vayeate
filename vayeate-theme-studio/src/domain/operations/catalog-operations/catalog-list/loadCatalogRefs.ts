import { injectable } from 'tsyringe';
import { catalogService } from '../../../../gateway/services/catalog-service';
import { StoreStateSetter } from '../../../state/store-state-setter';

/** Load catalog refs from data dir into store (set catalog entries from ref list). */
@injectable()
export class LoadCatalogRefs {
  constructor(private readonly storeStateSetter: StoreStateSetter) {}

  async execute(): Promise<void> {
    const refs = await catalogService.listCatalogs();
    this.storeStateSetter.apply({
      type: 'SET_STORE_CATALOG_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
    });
  }
}



