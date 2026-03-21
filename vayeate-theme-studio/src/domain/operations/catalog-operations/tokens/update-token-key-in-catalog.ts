import { injectable } from 'tsyringe';
import type { Catalog, TokenType } from '../../../../model/schemas';

@injectable()
export class UpdateTokenKeyInCatalog {
  execute(catalog: Catalog, oldKey: string, newKey: string, tokenType: TokenType): Catalog {
    return {
      ...catalog,
      tokens: catalog.tokens.map((t) =>
        t.key === oldKey && t.type === tokenType ? { ...t, key: newKey } : t,
      ),
    };
  }
}
