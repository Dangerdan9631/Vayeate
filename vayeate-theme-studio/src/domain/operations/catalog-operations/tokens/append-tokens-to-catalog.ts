import type { Catalog, Token } from '../../../../model/schemas';

export function appendTokensToCatalog(catalog: Catalog, tokens: Token[]): Catalog {
  return { ...catalog, tokens: [...catalog.tokens, ...tokens] };
}
