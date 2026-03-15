import type { Catalog, CatalogReference, Template, TemplateReference, Theme, ThemeReference } from '../../model/schemas';

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

/** Store state: only maps; refs are derived via get*RefsFromStore. */
export interface StoreState {
  catalogs: CatalogStoreMap;
  templates: TemplateStoreMap;
  themes: ThemeStoreMap;
}

/** Derive catalog refs from the catalogs map (sorted by name, then version). */
export function getCatalogRefsFromStore(store: StoreState): CatalogReference[] {
  const refs: CatalogReference[] = [];
  for (const name of Object.keys(store.catalogs).sort()) {
    for (const version of Object.keys(store.catalogs[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

/** Derive template refs from the templates map (sorted by name, then version desc). */
export function getTemplateRefsFromStore(store: StoreState): TemplateReference[] {
  const refs: TemplateReference[] = [];
  for (const name of Object.keys(store.templates).sort()) {
    for (const version of Object.keys(store.templates[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

/** Derive theme refs from the themes map (sorted by name, then version). */
export function getThemeRefsFromStore(store: StoreState): ThemeReference[] {
  const refs: ThemeReference[] = [];
  for (const name of Object.keys(store.themes).sort()) {
    for (const version of Object.keys(store.themes[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}
