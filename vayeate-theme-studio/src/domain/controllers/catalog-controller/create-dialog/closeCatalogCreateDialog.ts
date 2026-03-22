import { singleton } from 'tsyringe';
import {
  CloseCatalogCreateDialog,
  CreateCatalog,
  GetCatalogCreateDialogData,
  SetCatalogCreateDialogData,
  SetSelectedCatalog,
} from '../../../operations/catalog-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { catalogStackId } from '../../../utils/stack-id';

export type CatalogCreateDialogOutcome = 'OK' | 'Cancel';

@singleton()
export class CloseCatalogCreateDialogController {
  constructor(
    private readonly closeCatalogCreateDialog: CloseCatalogCreateDialog,
    private readonly createCatalog: CreateCatalog,
    private readonly getCatalogCreateDialogData: GetCatalogCreateDialogData,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
    private readonly setCatalogCreateDialogData: SetCatalogCreateDialogData,
    private readonly setSelectedCatalog: SetSelectedCatalog,
  ) {}

  async run(outcome: CatalogCreateDialogOutcome): Promise<void> {
    if (outcome === 'OK') {
      const { createFormName, createFormType } = this.getCatalogCreateDialogData.execute();
      const params = { name: createFormName.trim(), type: createFormType };
      this.closeCatalogCreateDialog.execute();
      this.setCatalogCreateDialogData.execute({ name: '', type: 'manual' });
      const ref = await this.createCatalog.execute(params);
      this.setSelectedCatalog.execute(ref);
      this.setCurrentUndoStackId.execute(catalogStackId(ref.name, ref.version));
      return;
    }

    this.closeCatalogCreateDialog.execute();
    this.setCatalogCreateDialogData.execute({ name: '', type: 'manual' });
  }
}
