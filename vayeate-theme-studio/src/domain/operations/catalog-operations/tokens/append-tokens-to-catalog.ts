import { injectable } from 'tsyringe';
import type { Catalog, Token } from '../../../../model/schemas';

@injectable()
export class AppendTokensToCatalog {
  execute(catalog: Catalog, tokens: Token[]): Catalog {
    return { ...catalog, tokens: [...catalog.tokens, ...tokens] };
  }
}
