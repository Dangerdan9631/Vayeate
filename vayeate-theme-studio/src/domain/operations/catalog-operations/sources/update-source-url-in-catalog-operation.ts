import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';

@injectable()
export class UpdateSourceUrlInCatalogOperation {
  execute(catalog: Catalog, sourceIndex: number, url: string): Catalog {
    const sources = catalog.sources.map((s, i) =>
      i === sourceIndex ? { ...s, url: url.trim() } : s,
    );
    return { ...catalog, sources };
  }
}
