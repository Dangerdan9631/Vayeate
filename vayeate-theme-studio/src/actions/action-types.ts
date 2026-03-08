import type { TabId } from '../ui/tabs';
import type { Catalog, Source, Template, Theme, TokenType } from '../model/schemas';

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
  | { type: 'REVERT_TO_VERSION'; name: string; version: string }
  | { type: 'LOAD_TEMPLATE_REFS' }
  | { type: 'SELECT_TEMPLATE'; name: string; version: string }
  | { type: 'OPEN_TEMPLATE_CREATE_DIALOG' }
  | { type: 'CLOSE_TEMPLATE_CREATE_DIALOG' }
  | { type: 'CREATE_TEMPLATE'; params: { name: string } }
  | { type: 'SAVE_TEMPLATE'; template: Template }
  | { type: 'DELETE_TEMPLATE_VERSION'; name: string; version: string }
  | { type: 'LOAD_THEME_REFS' }
  | { type: 'SELECT_THEME'; name: string; version: string }
  | { type: 'OPEN_THEME_CREATE_DIALOG' }
  | { type: 'CLOSE_THEME_CREATE_DIALOG' }
  | { type: 'CREATE_THEME'; params: { name: string } }
  | { type: 'SAVE_THEME'; theme: Theme }
  | { type: 'THEME_PANE_SELECTIONS_CHANGED'; checkedColorRefs: string[]; checkedContrastRefs: string[] }
  | { type: 'RESTORE_THEME_STATE'; theme?: Theme | null; checkedColorRefs?: string[]; checkedContrastRefs?: string[]; hueAdjustment?: number; deleteThemeVersionOnRestore?: { name: string; version: string } }
  | { type: 'SET_THEME_HUE_ADJUSTMENT'; value: number }
  | { type: 'RESTORE_TEMPLATE_STATE'; template: Template | null; deleteTemplateVersionOnRestore?: { name: string; version: string } }
  | { type: 'RESTORE_CATALOG_STATE'; catalog: Catalog | null; deleteVersionOnRestore?: { name: string; version: string } }
  | { type: 'DELETE_THEME_VERSION'; name: string; version: string }
  | { type: 'DISMISS_THEME_SAVE_ERROR' }
  | { type: 'GENERATE_THEME'; themeName: string; themeVersion: string; templateName: string; templateVersion: string };
