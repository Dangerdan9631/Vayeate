import type { Catalog } from '../../../model/schemas';

export function canLockCatalog(catalog: Catalog | null | undefined): catalog is Catalog {
  return !!catalog && catalog.type === 'manual' && !catalog.locked;
}
