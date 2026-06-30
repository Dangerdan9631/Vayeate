import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { nextPatchVersion } from '../../../utils/next-patch-version';

/**
 * Increments catalog version for edit for edit tracking.
 */

@singleton()
export class BumpCatalogVersionForEditOperation {

  /**
   * Runs the bump catalog version for edit mutation.
   * @param catalog Catalog (Catalog).
   * @returns Catalog result.
   */
  execute(catalog: Catalog): Catalog {
    return catalog.locked
      ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
      : catalog;
  }
}
