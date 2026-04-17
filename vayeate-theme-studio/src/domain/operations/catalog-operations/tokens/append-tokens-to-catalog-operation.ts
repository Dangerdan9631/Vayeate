import { singleton } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schema/catalog';

@singleton()
export class AppendTokensToCatalogOperation {
  execute(catalog: Catalog, tokens: Token[]): Catalog {
    return { ...catalog, tokens: [...catalog.tokens, ...tokens] };
  }
}
