import { singleton } from 'tsyringe';
import { CloseCatalogCreateDialogOperation } from '../../../operations/catalog-operations/create-dialog/close-catalog-create-dialog-operation';
import { CreateCatalogOperation } from '../../../operations/catalog-operations/catalog-list/create-catalog-operation';
import { GetCatalogCreateDialogDataOperation } from '../../../operations/catalog-operations/create-dialog/get-catalog-create-dialog-data-operation';
import { SetCatalogCreateDialogDataOperation } from '../../../operations/catalog-operations/create-dialog/set-catalog-create-dialog-data-operation';
import { SetSelectedCatalogOperation } from '../../../operations/catalog-operations/catalog-list/set-selected-catalog-operation';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations/set-current-undo-stack-id-operation';
import { catalogStackId } from '../../../utils/catalog-stack-id';

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

  run(outcome: CatalogCreateDialogOutcome): void {
    if (outcome === 'OK') {
      const { createFormName, createFormType } = this.getCatalogCreateDialogData.execute();
      const params = { name: createFormName.trim(), type: createFormType };
      this.closeCatalogCreateDialog.execute();
      this.setCatalogCreateDialogData.execute({ name: '', type: 'manual' });
      const ref = this.createCatalog.execute(params);
      this.setSelectedCatalog.execute(ref);
      this.setCurrentUndoStackId.execute(catalogStackId(ref.name, ref.version));
      return;
    }

    this.closeCatalogCreateDialog.execute();
    this.setCatalogCreateDialogData.execute({ name: '', type: 'manual' });
  }
}
