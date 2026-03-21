import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../utils/version';
import { catalogStackId } from '../../../utils/stack-id';
import {
  DeleteCatalog,
  LoadCatalog,
  RefreshCatalogRefs,
  SetCatalog,
  SetSelectedRef,
} from '../../../operations/catalog-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';

@singleton()
export class DeleteCatalogVersionController {
  constructor(
    private readonly deleteCatalog: DeleteCatalog,
    private readonly refreshCatalogRefs: RefreshCatalogRefs,
    private readonly setSelectedRef: SetSelectedRef,
    private readonly loadCatalog: LoadCatalog,
    private readonly setCatalog: SetCatalog,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(name: string, version: string): Promise<void> {
    await this.deleteCatalog.execute(name, version);
    const refs = await this.refreshCatalogRefs.execute();
    const next = findNearestVersionRef(refs, name, version);

    if (next) {
      this.setSelectedRef.execute(next);
      await this.loadCatalog.execute(next.name, next.version);
      this.setCurrentUndoStackId.execute(catalogStackId(next.name, next.version));
    } else {
      this.setSelectedRef.execute(null);
      this.setCatalog.execute(null);
      this.setCurrentUndoStackId.execute(null);
    }
  }
}
