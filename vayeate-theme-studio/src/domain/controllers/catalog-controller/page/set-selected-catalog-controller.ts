import { singleton } from 'tsyringe';
import { LoadCatalogOperation, SetSelectedCatalogOperation } from '../../../operations/catalog-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { catalogStackId } from '../../../utils/stack-id';

@singleton()
export class SetSelectedCatalogController {
  constructor(
    private readonly loadCatalog: LoadCatalogOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(name: string, version: string): Promise<void> {
    const ref = { name, version };
    const catalog = await this.loadCatalog.execute(name, version);
    this.setSelectedCatalog.execute(ref, catalog ?? null);
    this.setCurrentUndoStackId.execute(catalogStackId(name, version));
  }
}
