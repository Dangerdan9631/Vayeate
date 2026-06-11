import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../model/background-queue';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../../catalog/state/catalogs-store';
import { CatalogUiStore } from '../../state/ui/catalog-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';

const noopContinuation: ContinuationHandler = {
  onQueue: () => noopContinuation,
  then: () => {},
};

/**
 * Refreshes catalog refs and select from persistence or derived state.
 */

@singleton()
export class RefreshCatalogRefsAndSelectOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the refresh catalog refs and select mutation.
   * @param selectName Select name (string).
   * @param selectVersion Select version (string).
   * @param catalog Catalog (Catalog).
   * @param refsChanged Refs changed (unknown).
   * @returns Background-queue continuation for chained async work.
   */

  execute(
    selectName?: string,
    selectVersion?: string,
    catalog?: Catalog,
    refsChanged = true,
  ): ContinuationHandler {
    if (selectName && selectVersion && catalog) {
      this.catalogUiStore.getStore().selectCatalog({ name: selectName, version: selectVersion });
      this.catalogsStore.getStore().upsertCatalogs([catalog]);
      this.catalogUiStore.getStore().setCatalogLoadState('loaded');
    } else if (selectName && selectVersion) {
      this.catalogUiStore.getStore().setCatalogLoadState('loading');
    }

    if (!refsChanged) {
      return noopContinuation;
    }

    return this.enqueueBackgroundAction.execute(
      'data_io',
      selectName && selectVersion
        ? `Refreshing catalog refs for ${selectName} ${selectVersion}`
        : 'Refreshing catalog refs',
      async () => {
        const refs = await this.catalogGateway.listCatalogs();
        this.catalogsStore.getStore().updateCatalogRefs(refs);
        let loadedSelectedCatalog = false;
        if (selectName && selectVersion) {
          const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
          if (match) {
            this.catalogUiStore.getStore().selectCatalog(match);
          }
          if (!catalog) {
            const ref = match ?? { name: selectName, version: selectVersion };
            const loaded = await this.catalogGateway.loadCatalog(ref.name, ref.version);
            if (loaded) {
              this.catalogsStore.getStore().upsertCatalogs([loaded]);
              this.catalogUiStore.getStore().setCatalogLoadState('loaded');
              loadedSelectedCatalog = true;
            }
          } else {
            loadedSelectedCatalog = true;
          }
        }
        if (selectName && selectVersion && !loadedSelectedCatalog) {
          this.catalogUiStore.getStore().setCatalogLoadState('unloaded');
        }
      }
    );
  }
}
