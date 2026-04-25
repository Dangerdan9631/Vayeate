import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/** Delete one catalog version from disk. Single responsibility: delete. */
@singleton()
export class DeleteCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  execute(name: string, version: string): void {
    this.enqueueBackgroundAction.execute(
      `Deleting catalog ${name} ${version}`,
      async () => {
        await this.catalogGateway.deleteCatalog(name, version);
      }
    );
  }
}


