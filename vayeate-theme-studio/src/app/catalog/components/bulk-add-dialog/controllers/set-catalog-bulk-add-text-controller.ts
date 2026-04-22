import { singleton } from 'tsyringe';
import { SetCatalogBulkAddTextOperation } from '../../../../../domain/operations/catalog-operations/bulk-add/set-catalog-bulk-add-text-operation';

@singleton()
export class SetCatalogBulkAddTextController {
  constructor(private readonly setCatalogBulkAddText: SetCatalogBulkAddTextOperation) {}

  run(value: string): void {
    this.setCatalogBulkAddText.execute(value);
  }
}
