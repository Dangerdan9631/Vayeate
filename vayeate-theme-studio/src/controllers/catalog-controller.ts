import type { Catalog } from '../model/schemas.js';

const PLACEHOLDER_CATALOG: Catalog = {
  name: 'new-catalog',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
};

/**
 * Creates a catalog with placeholder values.
 * Does not persist - callers must save via CatalogRepository.
 */
export function createCatalog(): Catalog {
  return { ...PLACEHOLDER_CATALOG };
}
