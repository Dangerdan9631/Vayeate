import type { Catalog } from '../../../../model/schemas';

export function revertCatalog(snapshot: Catalog, newVersion: string): Catalog {
  return { ...snapshot, version: newVersion, locked: false };
}
