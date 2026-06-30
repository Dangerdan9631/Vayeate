import { singleton } from 'tsyringe';
import { catalogDataFileKey } from '../../../model/data-path-keys';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../operations/background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../model/background-queue';

/**
 * Schedules deletion of a catalog file on disk via the background queue.
 */
@singleton()
export class DeleteCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  /**
   * Enqueues catalog file deletion with data_io ordering keyed by catalog path.
   *
   * @param name - Catalog name identifying the file to delete.
   * @param version - Catalog version identifying the file to delete.
   * @returns Background queue continuation for callers that need completion hooks.
   */
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

