import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';

@injectable()
export class RemoveSourceAtIndex {
  execute(catalog: Catalog, sourceIndex: number): Catalog {
    return {
      ...catalog,
      sources: catalog.sources.filter((_, i) => i !== sourceIndex),
    };
  }
}
