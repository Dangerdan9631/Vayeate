import type { Catalog, Token } from '../../../../model/schemas';

export function deduplicateBulkTokens(catalog: Catalog, incoming: Token[]): Token[] {
  const existingKeys = new Set(catalog.tokens.map((t) => `${t.type}::${t.key}`));
  return incoming.filter((t) => !existingKeys.has(`${t.type}::${t.key}`));
}
