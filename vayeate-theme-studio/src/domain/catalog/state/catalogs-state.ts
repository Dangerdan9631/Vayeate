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

export interface CatalogsState {
  catalogs: CatalogMap;
}

export const initialCatalogsState: CatalogsState = {
  catalogs: {},
};
