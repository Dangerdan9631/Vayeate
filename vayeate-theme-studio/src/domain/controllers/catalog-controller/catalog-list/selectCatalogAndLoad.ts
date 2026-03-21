import { singleton } from 'tsyringe';
import { LoadCatalog, SetSelectedRef } from '../../../operations/catalog-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { catalogStackId } from '../../../utils/stack-id';

@singleton()
export class SelectCatalogAndLoadController {
  constructor(
    private readonly setSelectedRef: SetSelectedRef,
    private readonly loadCatalog: LoadCatalog,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(name: string, version: string): Promise<void> {
    const ref = { name, version };
    this.setSelectedRef.execute(ref);
    await this.loadCatalog.execute(name, version);
    this.setCurrentUndoStackId.execute(catalogStackId(name, version));
  }
}
