import { singleton } from 'tsyringe';
import { SetCatalogBulkAddTextOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogBulkAddTextController {
  constructor(private readonly setCatalogBulkAddText: SetCatalogBulkAddTextOperation) {}

  run(value: string): void {
    this.setCatalogBulkAddText.execute(value);
  }
}
