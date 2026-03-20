import type { Catalog } from '../../../model/schemas';

export function canUpdateCatalogSource(
  catalog: Catalog | null | undefined,
  sourceIndex: number,
): catalog is Catalog {
  return !!catalog && sourceIndex >= 0 && sourceIndex < catalog.sources.length;
}
