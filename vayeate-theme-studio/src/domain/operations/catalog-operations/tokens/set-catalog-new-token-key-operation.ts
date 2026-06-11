import { singleton } from 'tsyringe';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

/**
 * Updates catalog new token key in the domain or UI store.
 */

@singleton()
export class SetCatalogNewTokenKeyOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  /**
   * Runs the set catalog new token key mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.catalogUiStore.getStore().setNewTokenKey(value);
  }
}

