import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../model/schema/primitives';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

@singleton()
export class SetCatalogNewSourceTokenTypeOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  execute(value: TokenType): void {
    this.catalogUiStore.getStore().setNewSourceData(undefined, value);
  }
}



