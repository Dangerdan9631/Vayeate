import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../../domain/utils/find-nearest-version-ref';
import { DeleteCatalogOperation } from '../../../../domain/catalog/operations/delete-catalog-operation';
import { SetSelectedCatalogOperation } from '../../../../domain/operations/delete/set-selected-catalog-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { LoadCatalogRefsOperation } from '../../../../domain/catalog/operations/load-catalog-refs-operation';
import { CatalogsStore, getCurrentCatalogRefs } from '../../../../domain/catalog/state/catalogs-store';

@singleton()
export class DeleteCurrentCatalogVersionController {
  constructor(
    private readonly catalogUiStore: CatalogUiStore,
    private readonly catalogsStore: CatalogsStore,
    private readonly deleteCatalog: DeleteCatalogOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
  ) {}

  async run(): Promise<void> {
    const ref = this.catalogUiStore.getStore().state.selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    this.deleteCatalog.execute(name, version);
    this.loadCatalogRefs.execute().then('Loading next catalog version', () => {
      const refs = getCurrentCatalogRefs(this.catalogsStore.getStore().state.catalogs);
      const next = findNearestVersionRef(refs, name, version);
      if (next) {
        this.setSelectedCatalog.execute(next);
      } else {
        this.setSelectedCatalog.execute(null);
      }
    });
  }
}
