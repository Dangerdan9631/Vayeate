import { singleton } from 'tsyringe';
import { OpenCatalogCreateDialog, SetCatalogCreateDialogData } from '../../../operations/catalog-operations';

@singleton()
export class OpenCatalogCreateDialogController {
  constructor(
    private readonly setCatalogCreateDialogData: SetCatalogCreateDialogData,
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialog,
  ) {}

  run(): void {
    this.setCatalogCreateDialogData.execute({ name: '', type: 'manual' });
    this.openCatalogCreateDialog.execute();
  }
}
