import type { Catalog, TokenKey, TokenType } from '../../../../model/schemas';

export function removeTokenFromCatalog(
  catalog: Catalog,
  key: TokenKey,
  tokenType: TokenType,
): Catalog {
  return {
    ...catalog,
    tokens: catalog.tokens.filter((t) => !(t.key === key && t.type === tokenType)),
  };
}
