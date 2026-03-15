import type { Catalog, Template, Theme } from '../../model/schemas';
import type { AppState } from './app-state';
import type { CatalogEntry, TemplateEntry, ThemeEntry } from './store-state';

/** Single catalog entry payload for batch set. */
export interface CatalogEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  catalog?: Catalog;
}

/** Single template entry payload for batch set. */
export interface TemplateEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  template?: Template;
}

/** Single theme entry payload for batch set. */
export interface ThemeEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  theme?: Theme;
}

export type StoreStateUpdate =
  | { type: 'SET_STORE_CATALOG_ENTRY'; name: string; version: string; isLoaded: boolean; catalog?: Catalog }
  | { type: 'SET_STORE_TEMPLATE_ENTRY'; name: string; version: string; isLoaded: boolean; template?: Template }
  | { type: 'SET_STORE_THEME_ENTRY'; name: string; version: string; isLoaded: boolean; theme?: Theme }
  | { type: 'SET_STORE_CATALOG_ENTRIES'; entries: CatalogEntryInput[] }
  | { type: 'SET_STORE_TEMPLATE_ENTRIES'; entries: TemplateEntryInput[] }
  | { type: 'SET_STORE_THEME_ENTRIES'; entries: ThemeEntryInput[] };

export type SetStoreState = (update: StoreStateUpdate) => void;

export function storeStateReducer(state: AppState, update: StoreStateUpdate): AppState {
  switch (update.type) {
    case 'SET_STORE_CATALOG_ENTRY': {
      const byVersion = { ...state.store.catalogs[update.name], [update.version]: { isLoaded: update.isLoaded, catalog: update.catalog ?? undefined } };
      const catalogs = { ...state.store.catalogs, [update.name]: byVersion };
      return { ...state, store: { ...state.store, catalogs } };
    }
    case 'SET_STORE_TEMPLATE_ENTRY': {
      const byVersion = { ...state.store.templates[update.name], [update.version]: { isLoaded: update.isLoaded, template: update.template ?? undefined } };
      const templates = { ...state.store.templates, [update.name]: byVersion };
      return { ...state, store: { ...state.store, templates } };
    }
    case 'SET_STORE_THEME_ENTRY': {
      const byVersion = { ...state.store.themes[update.name], [update.version]: { isLoaded: update.isLoaded, theme: update.theme ?? undefined } };
      const themes = { ...state.store.themes, [update.name]: byVersion };
      return { ...state, store: { ...state.store, themes } };
    }
    case 'SET_STORE_CATALOG_ENTRIES': {
      const catalogs: Record<string, Record<string, CatalogEntry>> = {};
      for (const entry of update.entries) {
        if (!catalogs[entry.name]) catalogs[entry.name] = {};
        catalogs[entry.name][entry.version] = { isLoaded: entry.isLoaded, catalog: entry.catalog ?? undefined };
      }
      return { ...state, store: { ...state.store, catalogs } };
    }
    case 'SET_STORE_TEMPLATE_ENTRIES': {
      const templates: Record<string, Record<string, TemplateEntry>> = {};
      for (const entry of update.entries) {
        if (!templates[entry.name]) templates[entry.name] = {};
        templates[entry.name][entry.version] = { isLoaded: entry.isLoaded, template: entry.template ?? undefined };
      }
      return { ...state, store: { ...state.store, templates } };
    }
    case 'SET_STORE_THEME_ENTRIES': {
      const themes: Record<string, Record<string, ThemeEntry>> = {};
      for (const entry of update.entries) {
        if (!themes[entry.name]) themes[entry.name] = {};
        themes[entry.name][entry.version] = { isLoaded: entry.isLoaded, theme: entry.theme ?? undefined };
      }
      return { ...state, store: { ...state.store, themes } };
    }
    default:
      return state;
  }
}
