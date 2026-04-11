import { singleton } from 'tsyringe';
import type { Catalog, TokenKey, TokenType } from '../../../../model/schemas';

@singleton()
export class RemoveTokenFromCatalogOperation {
  execute(catalog: Catalog, key: TokenKey, tokenType: TokenType): Catalog {
    return {
      ...catalog,
      tokens: catalog.tokens.filter((t) => !(t.key === key && t.type === tokenType)),
    };
  }
}
