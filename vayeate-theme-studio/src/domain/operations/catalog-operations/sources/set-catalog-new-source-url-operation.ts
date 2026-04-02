import { injectable } from 'tsyringe';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@injectable()
export class SetCatalogNewSourceUrlOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(value: string): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_NEW_SOURCE_URL', value });
  }
}

