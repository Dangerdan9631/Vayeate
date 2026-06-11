import { singleton } from 'tsyringe';
import { catalogDataFileKey } from '../../../../model/data-path-keys';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { Catalog } from '../../../../model/schema/catalog';

/**
 * Loads catalog from persistence into the store.
 */

@singleton()
export class LoadCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load catalog mutation.
   * @param name Name (string).
   * @param version Version (string).
   * @returns Promise resolving to Catalog | null.
   */

  execute(name: string, version: string): Promise<Catalog | null> {
    return this.enqueueBackgroundQueue.executeReturning(
      `Loading catalog ${name} ${version}`,
      () => this.catalogGateway.loadCatalog(name, version),
      'data_io',
      { key: catalogDataFileKey(name, version), access: 'read' },
    );
  }
}
