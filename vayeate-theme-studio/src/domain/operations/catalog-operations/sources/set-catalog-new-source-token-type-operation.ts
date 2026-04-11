import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schemas';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

@singleton()
export class SetCatalogNewSourceTokenTypeOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(value: TokenType): void {
    this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_NEW_SOURCE_TOKEN_TYPE', value });
  }
}



