import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schema/catalog';

@singleton()
export class DeduplicateBulkTokensOperation {
  execute(catalog: Catalog, incoming: Token[]): Token[] {
    const existingKeys = new Set(catalog.tokens.map((t) => `${t.type}::${t.key}`));
    return incoming.filter((t) => !existingKeys.has(`${t.type}::${t.key}`));
  }
}
