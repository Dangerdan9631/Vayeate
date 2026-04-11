import { singleton } from 'tsyringe';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@singleton()
export class SetCatalogTokensSearchTextOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(value: string): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_TOKENS_SEARCH_TEXT', value });
  }
}

