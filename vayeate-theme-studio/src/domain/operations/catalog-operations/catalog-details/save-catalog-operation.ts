import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/continuation-handler';

@singleton()
export class SaveCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  execute(catalog: Catalog): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      `Saving catalog ${catalog.name} ${catalog.version}`,
      async () => {
        await this.catalogGateway.saveCatalog(catalog);
      }
    );
  }
}
