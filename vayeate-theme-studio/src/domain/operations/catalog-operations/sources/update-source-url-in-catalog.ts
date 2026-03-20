import type { Catalog } from '../../../../model/schemas';

export function updateSourceUrlInCatalog(
  catalog: Catalog,
  sourceIndex: number,
  url: string,
): Catalog {
  const sources = catalog.sources.map((s, i) =>
    i === sourceIndex ? { ...s, url: url.trim() } : s,
  );
  return { ...catalog, sources };
}
