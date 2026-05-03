import { singleton } from 'tsyringe';
import { OpenCatalogCreateDialogOperation } from '../../../../domain/operations/create-dialog/operations/open-catalog-create-dialog-operation';

@singleton()
export class OpenCatalogCreateDialogController {
  constructor(
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialogOperation,
  ) {}

  run(): void {
    this.openCatalogCreateDialog.execute();
  }
}
