import { injectable } from 'tsyringe';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@injectable()
export class SetCatalogBulkAddTextOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(value: string): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_BULK_ADD_TEXT', value });
  }
}

