import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { catalogDataFileKey } from '../../../../model/data-path-keys';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';

/**
 * Persists catalog from the store through background I/O.
 */

@singleton()
export class SaveCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  /**
   * Runs the save catalog mutation.
   * @param catalog Catalog (Catalog).
   * @returns Background-queue continuation for chained async work.
   */

  execute(catalog: Catalog): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'data_io',
      `Saving catalog ${catalog.name} ${catalog.version}`,
      async () => {
        await this.catalogGateway.saveCatalog(catalog);
      },
      { key: catalogDataFileKey(catalog.name, catalog.version), access: 'write' },
    );
  }
}
