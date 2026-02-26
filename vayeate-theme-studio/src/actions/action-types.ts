import type { TabId } from '../ui/tabs';

export type AppAction =
  | { type: 'SET_ACTIVE_TAB'; tabId: TabId }
  | { type: 'CREATE_CATALOG' };
