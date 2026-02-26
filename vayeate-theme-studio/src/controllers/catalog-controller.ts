import type { Catalog, CatalogType } from '../model/schemas.js';

export interface CreateCatalogParams {
  name: string;
  type: CatalogType;
}

export function createCatalogWithParams(params: CreateCatalogParams): Catalog {
  return {
    name: params.name,
    version: '1.0.0',
    type: params.type,
    locked: false,
    sources: [],
    tokens: [],
  };
}
