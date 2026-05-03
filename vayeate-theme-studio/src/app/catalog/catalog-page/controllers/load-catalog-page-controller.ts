import { singleton } from 'tsyringe';
import { LoadCatalogRefsOperation } from '../../../../domain/operations/catalog-operations/catalog-list/load-catalog-refs-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

@singleton()
export class LoadCatalogPageController {
  constructor(
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly catalogUiStore: CatalogUiStore,
  ) { }

  run(): void {
    if (this.catalogUiStore.getStore().state.pageLoadState !== 'unloaded') return;
    this.loadCatalogRefs.execute();
  }
}
