import { singleton } from 'tsyringe';
import { SetSelectedCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-list/set-selected-catalog-operation';

@singleton()
export class SetSelectedCatalogController {
  constructor(
    private readonly setSelectedCatalog: SetSelectedCatalogOperation
  ) {}

  run(name: string, version: string): void {
    const ref = { name, version };
    this.setSelectedCatalog.execute(ref);
  }
}
