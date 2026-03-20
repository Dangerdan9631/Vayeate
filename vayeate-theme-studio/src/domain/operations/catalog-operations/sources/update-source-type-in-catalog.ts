import type { Catalog, SourceType } from '../../../../model/schemas';

export function updateSourceTypeInCatalog(
  catalog: Catalog,
  sourceIndex: number,
  value: SourceType,
): Catalog {
  const sources = catalog.sources.map((s, i) =>
    i === sourceIndex ? { ...s, type: value } : s,
  );
  return { ...catalog, sources };
}
