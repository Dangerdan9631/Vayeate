import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class ListCatalogRefsOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): Promise<CatalogReference[]> {
    return this.enqueueBackgroundQueue.executeReturning(
      'Listing catalogs',
      () => this.catalogGateway.listCatalogs(),
      'data_io',
    );
  }
}


