import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/** Persist catalog to disk only. Single responsibility: save. */
@singleton()
export class SaveCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  execute(catalog: Catalog): void {
    this.enqueueBackgroundAction.execute(
      `Saving catalog ${catalog.name} ${catalog.version}`,
      async () => {
        await this.catalogGateway.saveCatalog(catalog);
      }
    );
  }
}


