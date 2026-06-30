import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schema/catalog';

/**
 * Deduplicates bulk tokens before bulk catalog insert.
 */

@singleton()
export class DeduplicateBulkTokensOperation {

  /**
   * Runs the deduplicate bulk tokens mutation.
   * @param catalog Catalog (Catalog).
   * @param incoming Incoming (Token[]).
   * @returns Token[] result.
   */
  execute(catalog: Catalog, incoming: Token[]): Token[] {
    const existingKeys = new Set(catalog.tokens.map((t) => `${t.type}::${t.key}`));
    return incoming.filter((t) => !existingKeys.has(`${t.type}::${t.key}`));
  }
}
