import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class LoadCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): void {
    this.enqueueBackgroundAction.execute(
      'Loading catalogs',
      async () => {
        const refs = await this.catalogGateway.listCatalogs();
        this.catalogsStore.getStore().updateCatalogRefs(refs);
      }
    );
  }
}
