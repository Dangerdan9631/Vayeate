import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { TokenKey, TokenType } from '../../../../model/schema/primitives';

/**
 * Removes token from catalog from the parent entity in the store.
 */

@singleton()
export class RemoveTokenFromCatalogOperation {

  /**
   * Runs the remove token from catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param key Key (TokenKey).
   * @param tokenType Token type (TokenType).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, key: TokenKey, tokenType: TokenType): Catalog {
    return {
      ...catalog,
      tokens: catalog.tokens.filter((t) => !(t.key === key && t.type === tokenType)),
    };
  }
}
