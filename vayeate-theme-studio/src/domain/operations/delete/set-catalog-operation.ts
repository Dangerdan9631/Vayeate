import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';
import { CatalogsStore } from '../../catalog/state/catalogs-store';

/**
 * Updates catalog in the domain or UI store.
 */

@singleton()
export class SetCatalogOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  /**
   * Runs the set catalog mutation.
   * @param catalog Catalog (Catalog | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(catalog: Catalog | null): void {
    if (catalog) {
      this.catalogsStore.getStore().upsertCatalogs([catalog]);
    }
  }
}



