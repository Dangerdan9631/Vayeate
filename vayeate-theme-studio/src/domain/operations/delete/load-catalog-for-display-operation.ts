import { singleton } from 'tsyringe';
import { catalogDataFileKey } from '../../../model/data-path-keys';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';
import { CatalogsStore, getCurrentCatalog } from '../../catalog/state/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import { CatalogReference } from '../../../model/schema/template-schemas';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../model/background-queue';

/**
 * Loads catalog for display from persistence into the store.
 */

@singleton()
export class LoadCatalogForDisplayOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load catalog for display mutation.
   * @param refs Refs (CatalogReference[]).
   * @returns Background-queue continuation for chained async work.
   */

  execute(refs: CatalogReference[]): ContinuationHandler | undefined {
    if (refs.length === 0) {
      return undefined;
    }

    for (const ref of refs) {
      if (getCurrentCatalog(this.catalogsStore.getStore().state.catalogs, ref)) {
        continue;
      }

      this.enqueueBackgroundAction.execute(
        'data_io',
        `Loading catalog ${ref.name} ${ref.version}`,
        async () => {
          const loaded = await this.catalogGateway.loadCatalog(ref.name, ref.version);
          if (loaded) {
            this.catalogsStore.getStore().upsertCatalogs([loaded]);
          }
        },
        { key: catalogDataFileKey(ref.name, ref.version), access: 'read' },
      );
    }

    return undefined;
  }
}
