import { injectable } from 'tsyringe';
import type { Catalog, Source } from '../../../../model/schemas';

@injectable()
export class AddSourceToCatalogOperation {
  execute(catalog: Catalog, source: Source): Catalog {
    return { ...catalog, sources: [...catalog.sources, source] };
  }
}
