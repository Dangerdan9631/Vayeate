import { singleton } from 'tsyringe';
import { OpenCatalogCreateDialogOperation, SetCatalogCreateDialogDataOperation } from '../../../operations/catalog-operations';

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
