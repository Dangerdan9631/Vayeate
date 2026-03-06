import type { Catalog, CatalogType } from '../model/schemas.js';

const TAG = '[CatalogController]';

export interface CreateCatalogParams {
  name: string;
  type: CatalogType;
}

export function createCatalogWithParams(params: CreateCatalogParams): Catalog {
  console.debug(TAG, 'createCatalogWithParams', params.name, params.type);
  return {
    name: params.name,
    version: '1.0.0',
    type: params.type,
    locked: false,
    sources: [],
    tokens: [],
    semanticTokenTypes: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };
}
