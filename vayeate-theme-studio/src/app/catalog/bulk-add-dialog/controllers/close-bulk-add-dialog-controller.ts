import { singleton } from 'tsyringe';
import { SetCatalogBulkAddDialogOpenOperation } from '../../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-dialog-open-operation';
import { SetCatalogBulkAddTextOperation } from '../../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-text-operation';

@singleton()
export class CloseBulkAddDialogController {
  constructor(
    private readonly setCatalogBulkAddDialogOpen: SetCatalogBulkAddDialogOpenOperation,
    private readonly setCatalogBulkAddText: SetCatalogBulkAddTextOperation,
  ) {}

  run(): void {
    this.setCatalogBulkAddDialogOpen.execute(false);
    this.setCatalogBulkAddText.execute('');
  }
}
