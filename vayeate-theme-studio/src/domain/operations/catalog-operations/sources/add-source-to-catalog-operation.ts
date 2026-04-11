import { singleton } from 'tsyringe';
import type { Catalog, Source } from '../../../../model/schemas';

@singleton()
export class AddSourceToCatalogOperation {
  execute(catalog: Catalog, source: Source): Catalog {
    return { ...catalog, sources: [...catalog.sources, source] };
  }
}
