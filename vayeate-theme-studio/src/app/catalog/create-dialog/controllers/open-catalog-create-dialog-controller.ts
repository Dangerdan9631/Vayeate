import { singleton } from 'tsyringe';
import { OpenCatalogCreateDialogOperation } from '../../../../domain/operations/create-dialog/operations/open-catalog-create-dialog-operation';

/**
 * Opens the create-catalog dialog with default field values.
 */
@singleton()
export class OpenCatalogCreateDialogController {
  constructor(
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialogOperation,
  ) {}

  /**
   * Shows the create-catalog dialog.
   */
  run(): void {
    this.openCatalogCreateDialog.execute();
  }
}
