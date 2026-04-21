import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';

@singleton()
export class SetCatalogNewSourceTokenTypeOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(value: TokenType): void {
    this.catalogsStore.getStore().setNewSourceData(undefined, value);
  }
}



