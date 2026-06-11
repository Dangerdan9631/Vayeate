import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';

/**
 * Updates source url in catalog in the store.
 */

@singleton()
export class UpdateSourceUrlInCatalogOperation {

  /**
   * Runs the update source url in catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param sourceIndex Source index (number).
   * @param url Url (string).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, sourceIndex: number, url: string): Catalog {
    const sources = catalog.sources.map((s, i) =>
      i === sourceIndex ? { ...s, url: url.trim() } : s,
    );
    return { ...catalog, sources };
  }
}
