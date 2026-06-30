import { singleton } from 'tsyringe';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

/**
 * Updates catalog tokens search text in the domain or UI store.
 */

@singleton()
export class SetCatalogTokensSearchTextOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  /**
   * Runs the set catalog tokens search text mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.catalogUiStore.getStore().setTokensSearchText(value);
  }
}

