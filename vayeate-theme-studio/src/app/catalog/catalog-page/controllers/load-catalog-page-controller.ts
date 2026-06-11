import { singleton } from 'tsyringe';
import { LoadCatalogRefsOperation } from '../../../../domain/catalog/operations/load-catalog-refs-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

/**
 * Loads catalog references when the catalog page first mounts.
 */
@singleton()
export class LoadCatalogPageController {
  constructor(
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly catalogUiStore: CatalogUiStore,
  ) { }

  /**
   * Starts catalog ref loading if the page is still in the unloaded state.
   */
  run(): void {
    if (this.catalogUiStore.getStore().state.pageLoadState !== 'unloaded') return;
    this.loadCatalogRefs.execute();
  }
}
