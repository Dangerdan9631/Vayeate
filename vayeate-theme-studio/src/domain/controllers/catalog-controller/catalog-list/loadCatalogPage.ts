import { singleton } from 'tsyringe';
import { LoadCatalogRefs } from '../../../operations/catalog-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';

@singleton()
export class LoadCatalogPageController {
  constructor(
    private readonly loadCatalogRefs: LoadCatalogRefs,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(): Promise<void> {
    await this.loadCatalogRefs.execute();
    this.setCurrentUndoStackId.execute(null);
  }
}

