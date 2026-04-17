import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schema/catalog';

@singleton()
export class AddPlainTokenToCatalogOperation {
  execute(catalog: Catalog, token: Token): Catalog {
    return { ...catalog, tokens: [...catalog.tokens, token] };
  }
}
