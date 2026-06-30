import { singleton } from 'tsyringe';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

/**
 * Updates catalog new source url in the domain or UI store.
 */

@singleton()
export class SetCatalogNewSourceUrlOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  /**
   * Runs the set catalog new source url mutation.
   * @param value Value (string).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: string): void {
    this.catalogUiStore.getStore().setNewSourceData(value);
  }
}

