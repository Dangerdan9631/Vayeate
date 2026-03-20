import type { Catalog, Source } from '../../../../model/schemas';

export function addSourceToCatalog(catalog: Catalog, source: Source): Catalog {
  return { ...catalog, sources: [...catalog.sources, source] };
}
