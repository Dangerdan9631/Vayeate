import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';

/**
 * Checks whether a catalog is a loaded remote catalog eligible for source sync.
 */
@singleton()
export class ValidateSyncCatalog {
  /**
   * Narrows the catalog to a remote type when sync from sources is allowed.
   *
   * @param catalog - Current catalog selection, if any.
   * @returns True when the catalog exists and has type `remote`.
   */
  test(catalog: Catalog | null | undefined): catalog is Catalog & { type: 'remote' } {
    return !!catalog && catalog.type === 'remote';
  }
}
