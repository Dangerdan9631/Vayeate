import { singleton } from 'tsyringe';
import {
  CloseCatalogCreateDialogOperation,
  CreateCatalogOperation,
  GetCatalogCreateDialogDataOperation,
  SetCatalogCreateDialogDataOperation,
  SetSelectedCatalogOperation,
} from '../../../operations/catalog-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { catalogStackId } from '../../../utils/stack-id';

export type CatalogCreateDialogOutcome = 'OK' | 'Cancel';

@singleton()
export class CloseCatalogCreateDialogController {
  constructor(
    private readonly closeCatalogCreateDialog: CloseCatalogCreateDialogOperation,
    private readonly createCatalog: CreateCatalogOperation,
    private readonly getCatalogCreateDialogData: GetCatalogCreateDialogDataOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
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
