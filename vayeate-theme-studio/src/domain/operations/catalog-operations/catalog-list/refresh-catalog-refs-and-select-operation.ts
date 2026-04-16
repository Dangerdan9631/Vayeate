import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** After catalog mutations, refresh refs from disk and optionally select a catalog by name/version. */
@singleton()
export class RefreshCatalogRefsAndSelectOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(selectName?: string, selectVersion?: string): void {
    this.backgroundQueueGateway.enqueue(async () => {
      const refs = await this.catalogGateway.listCatalogs();
      this.catalogsStore.getStore().setCatalogMapEntries(refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })));
      if (selectName && selectVersion) {
        const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
        if (match) {
          const catalog = await this.catalogGateway.loadCatalog(match.name, match.version);
          this.catalogsStore.getStore().setSelectedRef(match);
          this.catalogsStore.getStore().setCatalog(catalog);
        }
      }
    }, `Refreshing catalog ${selectName} ${selectVersion}`);
  }
}
