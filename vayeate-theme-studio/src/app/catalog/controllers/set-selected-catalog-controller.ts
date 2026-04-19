import { singleton } from 'tsyringe';
import { LoadCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-details/load-catalog-operation';
import { SetSelectedCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-list/set-selected-catalog-operation';
import { SetCurrentUndoStackIdOperation } from '../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { catalogStackId } from '../../../domain/utils/catalog-stack-id';

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
