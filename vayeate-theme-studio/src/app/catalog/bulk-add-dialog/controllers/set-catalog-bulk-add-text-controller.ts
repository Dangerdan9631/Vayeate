import { singleton } from 'tsyringe';
import { SetCatalogBulkAddTextOperation } from '../../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-text-operation';

/**
 * Updates bulk-add dialog text and live parse preview counts.
 */
@singleton()
export class SetCatalogBulkAddTextController {
  constructor(private readonly setCatalogBulkAddText: SetCatalogBulkAddTextOperation) {}

  /**
   * Stores pasted JSON and refreshes parsed token counts.
   * @param value - Raw theme JSON text from the dialog.
   */
  run(value: string): void {
    this.setCatalogBulkAddText.execute(value);
  }
}
