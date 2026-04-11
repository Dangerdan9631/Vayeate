import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schemas';

@singleton()
export class AppendTokensToCatalogOperation {
  execute(catalog: Catalog, tokens: Token[]): Catalog {
    return { ...catalog, tokens: [...catalog.tokens, ...tokens] };
  }
}
