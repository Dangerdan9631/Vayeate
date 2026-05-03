import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class RefreshCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): Promise<CatalogReference[]> {
    return this.enqueueBackgroundQueue.executeReturning('Refreshing catalog refs', async () => {
      const refs = await this.catalogGateway.listCatalogs();
      this.catalogsStore.getStore().updateCatalogRefs(refs);
      return refs;
    });
  }
}


