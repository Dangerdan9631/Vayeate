import { singleton } from 'tsyringe';
import type { TokenType } from '../../../../../model/Common/schema/primitives';
import { CatalogUiStore } from '../../../../state/Catalog/ui/catalog-ui-store';

/**
 * Updates catalog new source token type in the domain or UI store.
 */

@singleton()
export class SetCatalogNewSourceTokenTypeOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  /**
   * Runs the set catalog new source token type mutation.
   * @param value Value (TokenType).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: TokenType): void {
    this.catalogUiStore.getStore().setNewSourceData(undefined, value);
  }
}



