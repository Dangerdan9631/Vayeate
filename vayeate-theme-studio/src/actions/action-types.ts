import type { TabId } from '../ui/tabs';
import type { Catalog, Source, TokenType } from '../model/schemas';

export type AppAction =
  | { type: 'SET_ACTIVE_TAB'; tabId: TabId }
  | { type: 'LOAD_CATALOG_REFS' }
  | { type: 'SELECT_CATALOG'; name: string; version: string }
  | { type: 'OPEN_CREATE_DIALOG' }
  | { type: 'CLOSE_CREATE_DIALOG' }
  | { type: 'CREATE_CATALOG'; params: { name: string; type: 'manual' | 'remote' } }
  | { type: 'SAVE_CATALOG'; catalog: Catalog }
  | { type: 'DELETE_VERSION'; name: string; version: string }
  | { type: 'UPDATE_CATALOG_SOURCES'; sources: Source[] }
  | { type: 'LOCK_CATALOG' }
  | { type: 'SYNC_CATALOG'; catalog: Catalog }
  | { type: 'ADD_TOKEN'; key: string; tokenType: TokenType }
  | { type: 'REMOVE_TOKEN'; key: string; tokenType: TokenType }
  | { type: 'UPDATE_TOKEN_KEY'; oldKey: string; newKey: string; tokenType: TokenType }
  | { type: 'REVERT_TO_VERSION'; name: string; version: string };
