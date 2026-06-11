import { singleton } from 'tsyringe';
import type { Catalog, Source } from '../../../../model/schema/catalog';

/**
 * Adds source to catalog to the parent entity in the store.
 */

@singleton()
export class AddSourceToCatalogOperation {

  /**
   * Runs the add source to catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param source Source (Source).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, source: Source): Catalog {
    return { ...catalog, sources: [...catalog.sources, source] };
  }
}
