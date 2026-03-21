import { singleton } from 'tsyringe';
import { SetCatalogBulkAddText } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogBulkAddTextController {
  constructor(private readonly setCatalogBulkAddText: SetCatalogBulkAddText) {}

  run(value: string): void {
    this.setCatalogBulkAddText.execute(value);
  }
}
