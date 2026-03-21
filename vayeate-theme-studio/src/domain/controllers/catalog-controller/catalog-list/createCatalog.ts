import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import {
  CreateCatalog,
  RefreshCatalogRefs,
  SetCatalog,
  SetSelectedRef,
} from '../../../operations/catalog-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { catalogStackId } from '../../../utils/stack-id';

@singleton()
export class CreateCatalogController {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly createCatalog: CreateCatalog,
    private readonly refreshCatalogRefs: RefreshCatalogRefs,
    private readonly setCatalog: SetCatalog,
    private readonly setSelectedRef: SetSelectedRef,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(params: { name: string; type: 'manual' | 'remote' }): Promise<void> {
    this.appStateSetter.apply({ type: 'SET_IS_CREATING', value: true });
    this.appStateSetter.apply({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
    try {
      const catalog = await this.createCatalog.execute(params);
      await this.refreshCatalogRefs.execute();
      this.setCatalog.execute(catalog);
      this.setSelectedRef.execute({ name: catalog.name, version: catalog.version });
      this.setCurrentUndoStackId.execute(catalogStackId(catalog.name, catalog.version));
    } finally {
      this.appStateSetter.apply({ type: 'SET_IS_CREATING', value: false });
    }
  }
}
