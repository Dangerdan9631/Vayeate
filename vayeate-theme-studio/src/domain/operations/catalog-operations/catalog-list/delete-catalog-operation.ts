import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Delete one catalog version from disk. Single responsibility: delete. */
@singleton()
export class DeleteCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) { }

  execute(name: string, version: string): void {
    this.backgroundQueueGateway.enqueue(async() => {
      await this.catalogGateway.deleteCatalog(name, version);
    });
  }
}


