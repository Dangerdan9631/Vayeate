import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import type { SourceType } from '../../../../model/schema/primitives';

@singleton()
export class UpdateSourceTypeInCatalogOperation {
  execute(catalog: Catalog, sourceIndex: number, value: SourceType): Catalog {
    const sources = catalog.sources.map((s, i) =>
      i === sourceIndex ? { ...s, type: value } : s,
    );
    return { ...catalog, sources };
  }
}
