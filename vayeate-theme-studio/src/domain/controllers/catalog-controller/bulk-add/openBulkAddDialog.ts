import { singleton } from 'tsyringe';
import { SetCatalogBulkAddDialogOpen, SetCatalogBulkAddText } from '../../../operations/catalog-operations';

@singleton()
export class OpenBulkAddDialogController {
  constructor(
    private readonly setCatalogBulkAddDialogOpen: SetCatalogBulkAddDialogOpen,
    private readonly setCatalogBulkAddText: SetCatalogBulkAddText,
  ) {}

  run(): void {
    this.setCatalogBulkAddDialogOpen.execute(true);
    this.setCatalogBulkAddText.execute('');
  }
}
