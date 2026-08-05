import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../../model/Catalog/schema/catalog';

/**
 * Locks catalog to prevent concurrent edits.
 */

@singleton()
export class LockCatalogOperation {

  /**
   * Runs the lock catalog mutation.
   * @param catalog Catalog (Catalog).
   * @returns Catalog result.
   */
  execute(catalog: Catalog): Catalog {
    return { ...catalog, locked: true };
  }
}
