import { injectable } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schemas';

@injectable()
export class AddPlainTokenToCatalog {
  execute(catalog: Catalog, token: Token): Catalog {
    return { ...catalog, tokens: [...catalog.tokens, token] };
  }
}
