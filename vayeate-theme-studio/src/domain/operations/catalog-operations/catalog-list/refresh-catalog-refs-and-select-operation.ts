import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class RefreshCatalogRefsAndSelectOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(selectName?: string, selectVersion?: string): void {
    this.enqueueBackgroundAction.execute(
      `Refreshing catalog ${selectName} ${selectVersion}`,
      async () => {
        const refs = await this.catalogGateway.listCatalogs();
        this.catalogsStore.getStore().updateCatalogRefs(refs);
        if (selectName && selectVersion) {
          const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
          if (match) {
            const catalog = await this.catalogGateway.loadCatalog(match.name, match.version);
            if (catalog) {
              this.catalogsStore.getStore().selectCatalog(match);
              this.catalogsStore.getStore().updateCatalog(catalog);
            }
          }
        }
      }
    );
  }
}
