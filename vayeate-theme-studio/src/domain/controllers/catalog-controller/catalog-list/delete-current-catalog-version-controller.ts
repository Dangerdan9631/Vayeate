import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { findNearestVersionRef } from '../../../utils/find-nearest-version-ref';
import { catalogStackId } from '../../../utils/catalog-stack-id';
import { DeleteCatalogOperation } from '../../../operations/catalog-operations/catalog-list/delete-catalog-operation';
import { LoadCatalogOperation } from '../../../operations/catalog-operations/catalog-details/load-catalog-operation';
import { RefreshCatalogRefsOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-operation';
import { SetSelectedCatalogOperation } from '../../../operations/catalog-operations/catalog-list/set-selected-catalog-operation';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations/set-current-undo-stack-id-operation';

@singleton()
export class DeleteCurrentCatalogVersionController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly deleteCatalog: DeleteCatalogOperation,
    private readonly refreshCatalogRefs: RefreshCatalogRefsOperation,
    private readonly loadCatalog: LoadCatalogOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(): Promise<void> {
    const ref = this.catalogsStateGetter.current().selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    await this.deleteCatalog.execute(name, version);
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
