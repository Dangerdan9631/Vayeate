import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schema/catalog';

/**
 * Adds plain token to catalog to the parent entity in the store.
 */

@singleton()
export class AddPlainTokenToCatalogOperation {

  /**
   * Runs the add plain token to catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param token Token (Token).
   * @returns Catalog result.
   */
  execute(catalog: Catalog, token: Token): Catalog {
    return { ...catalog, tokens: [...catalog.tokens, token] };
  }
}
