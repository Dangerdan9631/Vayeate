import type { Catalog, Token } from '../../../../model/schemas';

export function addPlainTokenToCatalog(catalog: Catalog, token: Token): Catalog {
  return { ...catalog, tokens: [...catalog.tokens, token] };
}
