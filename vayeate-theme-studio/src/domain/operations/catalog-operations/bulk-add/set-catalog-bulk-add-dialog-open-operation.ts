import { injectable } from 'tsyringe';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@injectable()
export class SetCatalogBulkAddDialogOpenOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(value: boolean): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_BULK_ADD_DIALOG_OPEN', value });
  }
}

