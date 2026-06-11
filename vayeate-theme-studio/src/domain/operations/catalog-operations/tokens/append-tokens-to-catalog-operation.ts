import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schema/catalog';

/**
 * Appends tokens to catalog to the template or catalog in the store.
 */

@singleton()
export class AppendTokensToCatalogOperation {

  /**
   * Runs the append tokens to catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param tokens Tokens (Token[]).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, tokens: Token[]): Catalog {
    return { ...catalog, tokens: [...catalog.tokens, ...tokens] };
  }
}
