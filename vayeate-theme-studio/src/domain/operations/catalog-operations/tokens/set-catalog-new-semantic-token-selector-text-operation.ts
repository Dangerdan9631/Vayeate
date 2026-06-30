import { singleton } from 'tsyringe';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

/**
 * Updates catalog new semantic token selector text in the domain or UI store.
 */

@singleton()
export class SetCatalogNewSemanticTokenSelectorTextOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  /**
   * Runs the set catalog new semantic token selector text mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.catalogUiStore.getStore().setNewSemanticTokenSelectorText(value);
  }
}
