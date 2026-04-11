import { singleton } from 'tsyringe';
import { OpenCatalogCreateDialogOperation } from '../../../operations/catalog-operations/create-dialog/open-catalog-create-dialog-operation';
import { SetCatalogCreateDialogDataOperation } from '../../../operations/catalog-operations/create-dialog/set-catalog-create-dialog-data-operation';

@singleton()
export class OpenCatalogCreateDialogController {
  constructor(
    private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation,
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialogOperation,
  ) {}

  run(): void {
    this.setCatalogCreateDialogData.execute({ name: '', type: 'manual' });
    this.openCatalogCreateDialog.execute();
  }
}
