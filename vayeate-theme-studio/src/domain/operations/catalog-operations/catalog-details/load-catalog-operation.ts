import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { Catalog } from '../../../../model/schema/catalog';

@singleton()
export class LoadCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): Promise<Catalog | null> {
    return this.enqueueBackgroundQueue.executeReturning(`Loading catalog ${name} ${version}`, () =>
      this.catalogGateway.loadCatalog(name, version),
    );
  }
}
