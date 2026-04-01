import { singleton } from 'tsyringe';
import { SetCatalogBulkAddDialogOpenOperation, SetCatalogBulkAddTextOperation } from '../../../operations/catalog-operations';

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
