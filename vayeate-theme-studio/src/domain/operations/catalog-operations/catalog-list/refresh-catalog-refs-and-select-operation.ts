import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

@singleton()
export class RefreshCatalogRefsAndSelectOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(selectName?: string, selectVersion?: string): void {
    this.enqueueBackgroundAction.execute(async () => {
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
    }, `Refreshing catalog ${selectName} ${selectVersion}`);
  }
}
