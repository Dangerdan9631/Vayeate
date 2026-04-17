import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { TokenType } from '../../../../model/schema/primitives';

@singleton()
export class UpdateSourceTokenTypeInCatalogOperation {
  execute(catalog: Catalog, sourceIndex: number, value: TokenType): Catalog {
    const sources = catalog.sources.map((s, i) =>
      i === sourceIndex ? { ...s, tokenType: value } : s,
    );
    return { ...catalog, sources };
  }
}
