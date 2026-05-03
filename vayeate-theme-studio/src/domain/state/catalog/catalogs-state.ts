import type { Catalog } from '../../../model/schema/catalog';

export interface CatalogState {
  isLoaded: boolean;
  catalog: Catalog | null;
}

export interface CatalogVersions {
  [version: string]: CatalogState;
}

export interface CatalogMap {
  [name: string]: CatalogVersions;
}

export interface CatalogsStateV2 {
  catalogs: CatalogMap;
}

export const initialCatalogsStateV2: CatalogsStateV2 = {
  catalogs: {},
};
