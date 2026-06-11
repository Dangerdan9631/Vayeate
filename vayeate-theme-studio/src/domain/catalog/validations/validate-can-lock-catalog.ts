import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';

/**
 * Checks whether the selected catalog can be locked (manual and not already locked).
 */
@singleton()
export class ValidateCanLockCatalog {
  /**
   * Allows lock only for manual catalogs that are still editable.
   *
   * @param catalog - Current catalog selection, if any.
   * @returns True when the catalog is manual and unlocked.
   */
  test(catalog: Catalog | null | undefined): boolean {
    return !!catalog && catalog.type === 'manual' && !catalog.locked;
  }
}
