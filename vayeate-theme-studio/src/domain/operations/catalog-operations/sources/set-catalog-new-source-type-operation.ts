import { singleton } from 'tsyringe';
import type { SourceType } from '../../../../model/schema/primitives';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

/**
 * Updates catalog new source type in the domain or UI store.
 */

@singleton()
export class SetCatalogNewSourceTypeOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  /**
   * Runs the set catalog new source type mutation.
   * @param value Value (SourceType).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: SourceType): void {
    this.catalogUiStore.getStore().setNewSourceData(undefined, undefined, value);
  }
}



