import { singleton } from 'tsyringe';
import { SetCatalogBulkAddDialogOpenOperation, SetCatalogBulkAddTextOperation } from '../../../operations/catalog-operations';

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
