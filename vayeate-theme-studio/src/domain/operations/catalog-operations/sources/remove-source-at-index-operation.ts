import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';

@singleton()
export class RemoveSourceAtIndexOperation {
  execute(catalog: Catalog, sourceIndex: number): Catalog {
    return {
      ...catalog,
      sources: catalog.sources.filter((_, i) => i !== sourceIndex),
    };
  }
}
