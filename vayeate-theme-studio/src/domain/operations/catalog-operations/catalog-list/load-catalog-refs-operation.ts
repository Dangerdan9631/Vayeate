import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/data/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/background-queue';

@singleton()
export class LoadCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      'Loading catalogs',
      async () => {
        const refs = await this.catalogGateway.listCatalogs();
        this.catalogsStore.getStore().updateCatalogRefs(refs);
      }
    );
  }
}
