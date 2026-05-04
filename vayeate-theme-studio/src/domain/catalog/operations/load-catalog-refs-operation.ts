import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../state/catalogs-store';
import { CatalogUiStore } from '../../state/ui/catalog-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../operations/background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../app/core/background-queue/continuation-handler';

@singleton()
export class LoadCatalogRefsOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): ContinuationHandler {
    this.catalogUiStore.getStore().setPageLoadState('loading');

    return this.enqueueBackgroundAction.execute(
      'data_io',
      'Loading catalogs refs',
      async () => {
        const refs = await this.catalogGateway.listCatalogs();
        this.catalogsStore.getStore().updateCatalogRefs(refs);
      }
    );
  }
}
