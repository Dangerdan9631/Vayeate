import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../domain/state/catalog/catalogs-store';
import { findNearestVersionRef } from '../../../domain/utils/find-nearest-version-ref';
import { catalogStackId } from '../../../domain/utils/catalog-stack-id';
import { DeleteCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-list/delete-catalog-operation';
import { LoadCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-details/load-catalog-operation';
import { RefreshCatalogRefsOperation } from '../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-operation';
import { SetSelectedCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-list/set-selected-catalog-operation';
import { SetCurrentUndoStackIdOperation } from '../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';

@singleton()
export class DeleteCurrentCatalogVersionController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly deleteCatalog: DeleteCatalogOperation,
    private readonly refreshCatalogRefs: RefreshCatalogRefsOperation,
    private readonly loadCatalog: LoadCatalogOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(): Promise<void> {
    const ref = this.catalogsStore.getStore().state.selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    this.deleteCatalog.execute(name, version);
    const refs = await this.refreshCatalogRefs.execute();
    const next = findNearestVersionRef(refs, name, version);

    if (next) {
      const catalog = await this.loadCatalog.execute(next.name, next.version);
      this.setSelectedCatalog.execute(next, catalog ?? null);
      this.setCurrentUndoStackId.execute(catalogStackId(next.name, next.version));
    } else {
      this.setSelectedCatalog.execute(null);
      this.setCurrentUndoStackId.execute(null);
    }
  }
}
