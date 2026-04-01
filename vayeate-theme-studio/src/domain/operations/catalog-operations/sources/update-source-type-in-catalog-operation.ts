import { injectable } from 'tsyringe';
import type { Catalog, SourceType } from '../../../../model/schemas';

@injectable()
export class UpdateSourceTypeInCatalogOperation {
  execute(catalog: Catalog, sourceIndex: number, value: SourceType): Catalog {
    const sources = catalog.sources.map((s, i) =>
      i === sourceIndex ? { ...s, type: value } : s,
    );
    return { ...catalog, sources };
  }
}
