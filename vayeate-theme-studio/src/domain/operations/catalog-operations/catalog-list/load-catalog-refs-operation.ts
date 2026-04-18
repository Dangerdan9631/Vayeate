import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Load catalog refs from data dir into store (set catalog entries from ref list). */
@singleton()
export class LoadCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: EnqueueBackgroundActionOperation,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.execute(async() => {
      const refs = await this.catalogGateway.listCatalogs();
      this.catalogsStore.getStore().setCatalogMapEntries(refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })));
    }, 'Loading catalogs');
  }
}
