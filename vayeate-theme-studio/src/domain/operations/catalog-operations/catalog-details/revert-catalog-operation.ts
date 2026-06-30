import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';

/**
 * Reverts catalog to a prior saved snapshot.
 */

@singleton()
export class RevertCatalogOperation {

  /**
   * Runs the revert catalog mutation.
   * @param snapshot Snapshot (Catalog).
   * @param newVersion New version (string).
   * @returns Catalog result.
   */
  execute(snapshot: Catalog, newVersion: string): Catalog {
    return { ...snapshot, version: newVersion, locked: false };
  }
}
