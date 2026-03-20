import type { Catalog } from '../../../../model/schemas';

export function lockCatalog(catalog: Catalog): Catalog {
  return { ...catalog, locked: true };
}
