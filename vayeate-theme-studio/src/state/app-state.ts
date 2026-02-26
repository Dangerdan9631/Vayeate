import type { Catalog, CatalogReference } from '../model/schemas';
import type { TabId } from '../ui/tabs';

export interface CatalogsState {
  catalogRefs: CatalogReference[];
  selectedRef: CatalogReference | null;
  catalog: Catalog | null;
  isCreating: boolean;
  createDialogOpen: boolean;
}

export interface QueueStatusState {
  isProcessing: boolean;
  queueLength: number;
}

export interface AppState {
  activeTab: TabId;
  catalogs: CatalogsState;
  queueStatus: QueueStatusState;
}

export const initialAppState: AppState = {
  activeTab: 'catalogs',
  catalogs: {
    catalogRefs: [],
    selectedRef: null,
    catalog: null,
    isCreating: false,
    createDialogOpen: false,
  },
  queueStatus: {
    isProcessing: false,
    queueLength: 0,
  },
};

export type AppStateUpdate =
  | { type: 'SET_ACTIVE_TAB'; tabId: TabId }
  | { type: 'SET_CATALOG_REFS'; refs: CatalogReference[] }
  | { type: 'SET_SELECTED_REF'; ref: CatalogReference | null }
  | { type: 'SET_CATALOG'; catalog: Catalog | null }
  | { type: 'SET_IS_CREATING'; value: boolean }
  | { type: 'SET_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_QUEUE_STATUS'; isProcessing: boolean; queueLength: number };

export function appStateReducer(state: AppState, update: AppStateUpdate): AppState {
  switch (update.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: update.tabId };
    case 'SET_CATALOG_REFS':
      return { ...state, catalogs: { ...state.catalogs, catalogRefs: update.refs } };
    case 'SET_SELECTED_REF':
      return { ...state, catalogs: { ...state.catalogs, selectedRef: update.ref } };
    case 'SET_CATALOG':
      return { ...state, catalogs: { ...state.catalogs, catalog: update.catalog } };
    case 'SET_IS_CREATING':
      return { ...state, catalogs: { ...state.catalogs, isCreating: update.value } };
    case 'SET_CREATE_DIALOG_OPEN':
      return { ...state, catalogs: { ...state.catalogs, createDialogOpen: update.value } };
    case 'SET_QUEUE_STATUS':
      return { ...state, queueStatus: { isProcessing: update.isProcessing, queueLength: update.queueLength } };
    default:
      return state;
  }
}
