import type { Catalog, Template, Theme } from '../../model/schemas';

export interface CatalogEntry {
  isLoaded: boolean;
  catalog: Catalog | undefined;
}

export interface TemplateEntry {
  isLoaded: boolean;
  template: Template | undefined;
}

export interface ThemeEntry {
  isLoaded: boolean;
  theme: Theme | undefined;
}

/** Map: entity name -> version -> entry */
export type CatalogStoreMap = Record<string, Record<string, CatalogEntry>>;
export type TemplateStoreMap = Record<string, Record<string, TemplateEntry>>;
export type ThemeStoreMap = Record<string, Record<string, ThemeEntry>>;

/** Parallel state: store/domain data (not yet used in app/reducer). */
export interface StoreState {
  catalogs: CatalogStoreMap;
  templates: TemplateStoreMap;
  themes: ThemeStoreMap;
}
