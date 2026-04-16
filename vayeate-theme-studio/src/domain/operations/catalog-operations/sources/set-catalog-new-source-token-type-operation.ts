import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schemas';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogNewSourceTokenTypeOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(value: TokenType): void {
    this.catalogsStore.getStore().setNewSourceTokenType(value);
  }
}



