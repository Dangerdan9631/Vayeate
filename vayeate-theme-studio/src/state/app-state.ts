import type { Catalog } from '../model/schemas';
import type { TabId } from '../ui/tabs';

export interface AppState {
  activeTab: TabId;
  catalogs: {
    created: Catalog | null;
    isCreating: boolean;
  };
}

export const initialAppState: AppState = {
  activeTab: 'catalogs',
  catalogs: {
    created: null,
    isCreating: false,
  },
};

export type AppStateUpdate =
  | { type: 'SET_ACTIVE_TAB'; tabId: TabId }
  | { type: 'CREATE_CATALOG_START' }
  | { type: 'CREATE_CATALOG_SUCCESS'; catalog: Catalog }
  | { type: 'CREATE_CATALOG_ERROR' };

export function appStateReducer(state: AppState, update: AppStateUpdate): AppState {
  switch (update.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: update.tabId };
    case 'CREATE_CATALOG_START':
      return { ...state, catalogs: { ...state.catalogs, isCreating: true } };
    case 'CREATE_CATALOG_SUCCESS':
      return {
        ...state,
        catalogs: { created: update.catalog, isCreating: false },
      };
    case 'CREATE_CATALOG_ERROR':
      return { ...state, catalogs: { ...state.catalogs, isCreating: false } };
    default:
      return state;
  }
}
