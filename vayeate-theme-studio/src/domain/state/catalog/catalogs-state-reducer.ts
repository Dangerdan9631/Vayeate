import type { AppState } from '../app-state';
import type { CatalogStoreMap, CatalogsState } from './catalogs-state';
import type {
  Catalog,
  CatalogReference,
  CatalogType,
  SourceType,
  TokenType,
} from '../../../model/schemas';

/** Single catalog entry payload for batch set. */
export interface CatalogEntryInput {
  name: string;
  version: string;
  isLoaded: boolean;
  catalog?: Catalog;
}

export type CatalogsStateUpdate =
  | { type: 'SET_SELECTED_REF'; ref: CatalogReference | null }
  | { type: 'SET_CATALOG'; catalog: Catalog | null }
  | { type: 'SET_LOADED_CATALOG_FOR_DISPLAY'; name: string; version: string; catalog: Catalog | null }
  | { type: 'SET_IS_CREATING'; value: boolean }
  | { type: 'SET_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_CATALOG_CREATE_FORM_NAME'; value: string }
  | { type: 'SET_CATALOG_CREATE_FORM_TYPE'; value: CatalogType }
  | { type: 'SET_CATALOG_BULK_ADD_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_CATALOG_BULK_ADD_TEXT'; value: string }
  | { type: 'SET_CATALOG_TOKENS_SEARCH_TEXT'; value: string }
  | { type: 'SET_CATALOG_NEW_SOURCE_URL'; value: string }
  | { type: 'SET_CATALOG_NEW_SOURCE_TOKEN_TYPE'; value: TokenType }
  | { type: 'SET_CATALOG_NEW_SOURCE_TYPE'; value: SourceType }
  | { type: 'SET_CATALOG_NEW_TOKEN_KEY'; value: string }
  | { type: 'SET_CATALOG_MAP_ENTRY'; name: string; version: string; isLoaded: boolean; catalog?: Catalog }
  | { type: 'SET_CATALOG_MAP_ENTRIES'; entries: CatalogEntryInput[] };

export function catalogsStateReducer(state: AppState, update: CatalogsStateUpdate): AppState {
  switch (update.type) {
    case 'SET_SELECTED_REF':
      return { ...state, catalogs: { ...state.catalogs, selectedRef: update.ref } };
    case 'SET_CATALOG':
      return { ...state, catalogs: { ...state.catalogs, catalog: update.catalog } };
    case 'SET_LOADED_CATALOG_FOR_DISPLAY': {
      const key = `${update.name}@${update.version}`;
      const loadedForDisplay = { ...state.catalogs.loadedForDisplay };
      if (update.catalog === null) {
        delete loadedForDisplay[key];
      } else {
        loadedForDisplay[key] = update.catalog;
      }
      return { ...state, catalogs: { ...state.catalogs, loadedForDisplay } };
    }
    case 'SET_IS_CREATING':
      return { ...state, catalogs: { ...state.catalogs, isCreating: update.value } };
    case 'SET_CREATE_DIALOG_OPEN':
      return { ...state, catalogs: { ...state.catalogs, createDialogOpen: update.value } };
    case 'SET_CATALOG_CREATE_FORM_NAME':
      return { ...state, catalogs: { ...state.catalogs, createFormName: update.value } };
    case 'SET_CATALOG_CREATE_FORM_TYPE':
      return { ...state, catalogs: { ...state.catalogs, createFormType: update.value } };
    case 'SET_CATALOG_BULK_ADD_DIALOG_OPEN':
      return { ...state, catalogs: { ...state.catalogs, bulkAddDialogOpen: update.value } };
    case 'SET_CATALOG_BULK_ADD_TEXT':
      return { ...state, catalogs: { ...state.catalogs, bulkAddText: update.value } };
    case 'SET_CATALOG_TOKENS_SEARCH_TEXT':
      return { ...state, catalogs: { ...state.catalogs, tokensSearchText: update.value } };
    case 'SET_CATALOG_NEW_SOURCE_URL':
      return { ...state, catalogs: { ...state.catalogs, newSourceUrl: update.value } };
    case 'SET_CATALOG_NEW_SOURCE_TOKEN_TYPE':
      return { ...state, catalogs: { ...state.catalogs, newSourceTokenType: update.value } };
    case 'SET_CATALOG_NEW_SOURCE_TYPE':
      return { ...state, catalogs: { ...state.catalogs, newSourceType: update.value } };
    case 'SET_CATALOG_NEW_TOKEN_KEY':
      return { ...state, catalogs: { ...state.catalogs, newTokenKey: update.value } };
    case 'SET_CATALOG_MAP_ENTRY': {
      const byVersion = {
        ...state.catalogs.catalogMap[update.name],
        [update.version]: { isLoaded: update.isLoaded, catalog: update.catalog ?? undefined },
      };
      const catalogMap = { ...state.catalogs.catalogMap, [update.name]: byVersion };
      return { ...state, catalogs: { ...state.catalogs, catalogMap } };
    }
    case 'SET_CATALOG_MAP_ENTRIES': {
      const catalogMap: CatalogStoreMap = {};
      for (const entry of update.entries) {
        if (!catalogMap[entry.name]) catalogMap[entry.name] = {};
        catalogMap[entry.name]![entry.version] = { isLoaded: entry.isLoaded, catalog: entry.catalog ?? undefined };
      }
      return { ...state, catalogs: { ...state.catalogs, catalogMap } };
    }
    default:
      return state;
  }
}

export type SetCatalogsState = (update: CatalogsStateUpdate) => void;
export class CatalogsStateSetter {
  constructor(private readonly set: SetCatalogsState) { }

  apply(update: CatalogsStateUpdate): void {
    this.set(update);
  }
}

export type GetCatalogsState = () => CatalogsState;
export class CatalogsStateGetter {
  constructor(private readonly get: GetCatalogsState) {}

  current(): CatalogsState {
    return this.get();
  }
}