import { singleton } from 'tsyringe';
import { OpenCatalogCreateDialogOperation } from '../../../../../domain/operations/catalog-operations/create-dialog/open-catalog-create-dialog-operation';

@singleton()
export class OpenCatalogCreateDialogController {
  constructor(
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialogOperation,
  ) {}

  run(): void {
    this.openCatalogCreateDialog.execute();
  }
}
