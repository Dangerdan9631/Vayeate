import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { SourceType } from '../../../../model/schema/primitives';

/**
 * Updates source type in catalog in the store.
 */

@singleton()
export class UpdateSourceTypeInCatalogOperation {

  /**
   * Runs the update source type in catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param sourceIndex Source index (number).
   * @param value Value (SourceType).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, sourceIndex: number, value: SourceType): Catalog {
    const sources = catalog.sources.map((s, i) =>
      i === sourceIndex ? { ...s, type: value } : s,
    );
    return { ...catalog, sources };
  }
}
