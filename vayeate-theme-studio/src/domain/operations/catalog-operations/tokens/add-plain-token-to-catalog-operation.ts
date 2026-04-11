import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schemas';

@singleton()
export class AddPlainTokenToCatalogOperation {
  execute(catalog: Catalog, token: Token): Catalog {
    return { ...catalog, tokens: [...catalog.tokens, token] };
  }
}
