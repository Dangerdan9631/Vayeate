import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { TokenKey, TokenType } from '../../../../model/schema/primitives';

@singleton()
export class RemoveTokenFromCatalogOperation {
  execute(catalog: Catalog, key: TokenKey, tokenType: TokenType): Catalog {
    return {
      ...catalog,
      tokens: catalog.tokens.filter((t) => !(t.key === key && t.type === tokenType)),
    };
  }
}
