import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';

/**
 * Removes source at index from the parent entity in the store.
 */

@singleton()
export class RemoveSourceAtIndexOperation {

  /**
   * Runs the remove source at index mutation.
   * @param catalog Catalog (Catalog).
   * @param sourceIndex Source index (number).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, sourceIndex: number): Catalog {
    return {
      ...catalog,
      sources: catalog.sources.filter((_, i) => i !== sourceIndex),
    };
  }
}
