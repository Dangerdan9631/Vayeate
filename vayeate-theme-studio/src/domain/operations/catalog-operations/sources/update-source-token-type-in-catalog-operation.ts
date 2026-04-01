import { injectable } from 'tsyringe';
import type { Catalog, TokenType } from '../../../../model/schemas';

@injectable()
export class UpdateSourceTokenTypeInCatalogOperation {
  execute(catalog: Catalog, sourceIndex: number, value: TokenType): Catalog {
    const sources = catalog.sources.map((s, i) =>
      i === sourceIndex ? { ...s, tokenType: value } : s,
    );
    return { ...catalog, sources };
  }
}
