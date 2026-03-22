import { singleton } from 'tsyringe';
import { LoadCatalog, SetSelectedCatalog } from '../../../operations/catalog-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { catalogStackId } from '../../../utils/stack-id';

@singleton()
export class SetSelectedCatalogController {
  constructor(
    private readonly loadCatalog: LoadCatalog,
    private readonly setSelectedCatalog: SetSelectedCatalog,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(name: string, version: string): Promise<void> {
    const ref = { name, version };
    const catalog = await this.loadCatalog.execute(name, version);
    this.setSelectedCatalog.execute(ref, catalog ?? null);
    this.setCurrentUndoStackId.execute(catalogStackId(name, version));
  }
}
