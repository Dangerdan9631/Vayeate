import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { TokenType } from '../../../../model/schema/primitives';

/**
 * Updates token key in catalog in the store.
 */

@singleton()
export class UpdateTokenKeyInCatalogOperation {

  /**
   * Runs the update token key in catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param oldKey Old key (string).
   * @param newKey New key (string).
   * @param tokenType Token type (TokenType).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, oldKey: string, newKey: string, tokenType: TokenType): Catalog {
    return {
      ...catalog,
      tokens: catalog.tokens.map((t) =>
        t.key === oldKey && t.type === tokenType ? { ...t, key: newKey } : t,
      ),
    };
  }
}
