import type { Catalog } from '../../../../model/schemas';

export function removeSourceAtIndex(catalog: Catalog, sourceIndex: number): Catalog {
  return {
    ...catalog,
    sources: catalog.sources.filter((_, i) => i !== sourceIndex),
  };
}
