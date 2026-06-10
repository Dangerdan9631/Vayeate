import { singleton } from 'tsyringe';
import { catalogDataFileKey } from '../../../model/data-path-keys';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../operations/background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../model/background-queue';

@singleton()
export class DeleteCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  execute(name: string, version: string): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'data_io',
      `Deleting catalog ${name} ${version}`,
      async () => {
        await this.catalogGateway.deleteCatalog(name, version);
      },
      { key: catalogDataFileKey(name, version), access: 'write' },
    );
  }
}


