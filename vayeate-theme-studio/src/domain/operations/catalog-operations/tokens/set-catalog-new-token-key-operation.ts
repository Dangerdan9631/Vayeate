import { singleton } from 'tsyringe';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@singleton()
export class SetCatalogNewTokenKeyOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(value: string): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_NEW_TOKEN_KEY', value });
  }
}

