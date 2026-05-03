import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../../domain/utils/find-nearest-version-ref';
import { DeleteCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-list/delete-catalog-operation';
import { SetSelectedCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-list/set-selected-catalog-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { LoadCatalogRefsOperation } from '../../../../domain/operations/catalog-operations/catalog-list/load-catalog-refs-operation';
import { CatalogsStore, getCurrentCatalogRefs } from '../../../../domain/state/data/catalogs-store';

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
    this.loadCatalogRefs.execute().then(() => {
      const refs = getCurrentCatalogRefs(this.catalogsStore.getStore().stateV2.catalogs);
      const next = findNearestVersionRef(refs, name, version);
      if (next) {
        this.setSelectedCatalog.execute(next);
      } else {
        this.setSelectedCatalog.execute(null);
      }
    });
  }
}
