import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Load catalog refs from data dir into store (set catalog entries from ref list). */
@singleton()
export class LoadCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => {
      const refs = await this.catalogGateway.listCatalogs();
      this.catalogsStore.getStore().setCatalogMapEntries(refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })));
    }, 'Loading catalogs');
  }
}
