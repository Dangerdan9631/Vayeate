import { singleton } from 'tsyringe';
import { SetCatalogBulkAddDialogOpenOperation } from '../../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-dialog-open-operation';
import { SetCatalogBulkAddTextOperation } from '../../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-text-operation';

/**
 * Closes the bulk-add dialog and clears pasted text without importing.
 */
@singleton()
export class CloseBulkAddDialogController {
  constructor(
    private readonly setCatalogBulkAddDialogOpen: SetCatalogBulkAddDialogOpenOperation,
    private readonly setCatalogBulkAddText: SetCatalogBulkAddTextOperation,
  ) {}

  /**
   * Hides the bulk-add dialog and resets its text field.
   */
  run(): void {
    this.setCatalogBulkAddDialogOpen.execute(false);
    this.setCatalogBulkAddText.execute('');
  }
}
