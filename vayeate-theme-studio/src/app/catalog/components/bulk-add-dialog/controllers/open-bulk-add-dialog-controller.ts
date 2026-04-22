import { singleton } from 'tsyringe';
import { SetCatalogBulkAddDialogOpenOperation } from '../../../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-dialog-open-operation';
import { SetCatalogBulkAddTextOperation } from '../../../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-text-operation';

@singleton()
export class OpenBulkAddDialogController {
  constructor(
    private readonly setCatalogBulkAddDialogOpen: SetCatalogBulkAddDialogOpenOperation,
    private readonly setCatalogBulkAddText: SetCatalogBulkAddTextOperation,
  ) {}

  run(): void {
    this.setCatalogBulkAddDialogOpen.execute(true);
    this.setCatalogBulkAddText.execute('');
  }
}
