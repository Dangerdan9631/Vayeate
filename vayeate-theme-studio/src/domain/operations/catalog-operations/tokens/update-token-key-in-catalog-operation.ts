import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { TokenType } from '../../../../model/schema/primitives';

@singleton()
export class UpdateTokenKeyInCatalogOperation {
  execute(catalog: Catalog, oldKey: string, newKey: string, tokenType: TokenType): Catalog {
    return {
      ...catalog,
      tokens: catalog.tokens.map((t) =>
        t.key === oldKey && t.type === tokenType ? { ...t, key: newKey } : t,
      ),
    };
  }
}
