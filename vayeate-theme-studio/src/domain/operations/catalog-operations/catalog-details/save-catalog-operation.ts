import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Persist catalog to disk only. Single responsibility: save. */
@singleton()
export class SaveCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) { }

  execute(catalog: Catalog): void {
    this.backgroundQueueGateway.enqueue(async() => {
      await this.catalogGateway.saveCatalog(catalog);
    }, `Saving catalog ${catalog.name} ${catalog.version}`);
  }
}


