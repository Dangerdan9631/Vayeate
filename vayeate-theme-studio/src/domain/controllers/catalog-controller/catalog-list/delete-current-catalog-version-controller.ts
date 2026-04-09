import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { findNearestVersionRef } from '../../../utils/version';
import { catalogStackId } from '../../../utils/stack-id';
import {
  DeleteCatalogOperation,
  LoadCatalogOperation,
  RefreshCatalogRefsOperation,
  SetSelectedCatalogOperation,
} from '../../../operations/catalog-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';

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
