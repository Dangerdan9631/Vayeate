import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../utils/version';
import { catalogStackId } from '../../../utils/stack-id';
import {
  DeleteCatalog,
  LoadCatalog,
  RefreshCatalogRefs,
  SetSelectedCatalog,
} from '../../../operations/catalog-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';

@singleton()
export class DeleteCatalogVersionController {
  constructor(
    private readonly deleteCatalog: DeleteCatalog,
    private readonly refreshCatalogRefs: RefreshCatalogRefs,
    private readonly loadCatalog: LoadCatalog,
    private readonly setSelectedCatalog: SetSelectedCatalog,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(name: string, version: string): Promise<void> {
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
