import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@injectable()
export class SetCatalogOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(catalog: Catalog | null): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CATALOG', catalog });
  }
}



