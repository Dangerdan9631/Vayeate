import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { TokenType } from '../../../../model/schema/primitives';

/**
 * Updates source token type in catalog in the store.
 */

@singleton()
export class UpdateSourceTokenTypeInCatalogOperation {

  /**
   * Runs the update source token type in catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param sourceIndex Source index (number).
   * @param value Value (TokenType).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, sourceIndex: number, value: TokenType): Catalog {
    const sources = catalog.sources.map((s, i) =>
      i === sourceIndex ? { ...s, tokenType: value } : s,
    );
    return { ...catalog, sources };
  }
}
