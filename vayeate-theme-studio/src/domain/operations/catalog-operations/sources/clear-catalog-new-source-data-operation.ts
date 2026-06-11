import { singleton } from 'tsyringe';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

/**
 * Clears catalog new source data from the store.
 */

@singleton()
export class ClearCatalogNewSourceDataOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  /**
   * Runs the clear catalog new source data mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.catalogUiStore.getStore().clearNewSourceData();
  }
}
