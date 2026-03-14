import type { TabId } from '../ui/tabs';
import type { Catalog, Template, Theme } from '../model/schemas';

export type AppAction =
  | { type: 'TAB_BAR_ON_SELECT'; tabId: TabId }
  | { type: 'CATALOG_PAGE_ON_LOAD' }
  | { type: 'CATALOG_LOAD_FOR_DISPLAY'; name: string; version: string }
  | { type: 'CATALOG_LIST_ON_SELECT'; name: string; version: string }
  | { type: 'CATALOG_CREATE_DIALOG_ON_OPEN' }
  | { type: 'CATALOG_CREATE_DIALOG_ON_CLOSE' }
  | { type: 'CATALOG_CREATE_FORM_ON_SUBMIT'; params: { name: string; type: 'manual' | 'remote' } }
  | { type: 'CATALOG_SAVE_BUTTON_ON_CLICK'; catalog: Catalog }
  | { type: 'CATALOG_VERSION_DELETE_BUTTON_ON_CLICK'; name: string; version: string }
  | { type: 'CATALOG_SYNC_BUTTON_ON_CLICK'; catalog: Catalog }
  | { type: 'CATALOG_REVERT_BUTTON_ON_CLICK'; name: string; version: string }
  | { type: 'TEMPLATE_PAGE_ON_LOAD' }
  | { type: 'TEMPLATE_LIST_ON_SELECT'; name: string; version: string }
  | { type: 'TEMPLATE_CREATE_DIALOG_ON_OPEN' }
  | { type: 'TEMPLATE_CREATE_DIALOG_ON_CLOSE' }
  | { type: 'TEMPLATE_CREATE_FORM_ON_SUBMIT'; params: { name: string } }
  | { type: 'TEMPLATE_SAVE_BUTTON_ON_CLICK'; template: Template }
  | { type: 'TEMPLATE_VERSION_DELETE_BUTTON_ON_CLICK'; name: string; version: string }
  | { type: 'THEME_PAGE_ON_LOAD' }
  | { type: 'THEME_LIST_ON_SELECT'; name: string; version: string }
  | { type: 'THEME_CREATE_DIALOG_ON_OPEN' }
  | { type: 'THEME_CREATE_DIALOG_ON_CLOSE' }
  | { type: 'THEME_CREATE_FORM_ON_SUBMIT'; params: { name: string } }
  | { type: 'THEME_SAVE_BUTTON_ON_CLICK'; theme: Theme }
  | { type: 'THEME_PANE_ON_SELECT'; checkedColorRefs: string[]; checkedContrastRefs: string[] }
  | { type: 'UNDO_PANEL_ON_RESTORE_THEME'; theme?: Theme | null; checkedColorRefs?: string[]; checkedContrastRefs?: string[]; hueAdjustment?: number; hueReferenceHex?: string; deleteThemeVersionOnRestore?: { name: string; version: string } }
  | { type: 'HUE_ADJUSTMENT_SLIDER_ON_DELTA'; value: number }
  | { type: 'HUE_REFERENCE_INPUT_ON_CHANGE'; value: string }
  | { type: 'UNDO_PANEL_ON_RESTORE_TEMPLATE'; template: Template | null; deleteTemplateVersionOnRestore?: { name: string; version: string } }
  | { type: 'UNDO_PANEL_ON_RESTORE_CATALOG'; catalog: Catalog | null; deleteVersionOnRestore?: { name: string; version: string } }
  | { type: 'THEME_VERSION_DELETE_BUTTON_ON_CLICK'; name: string; version: string }
  | { type: 'THEME_SAVE_ERROR_DIALOG_ON_CLOSE' }
  | { type: 'THEME_GENERATE_BUTTON_ON_CLICK'; themeName: string; themeVersion: string; templateName: string; templateVersion: string }
  | { type: 'VIEW_MENU_RELOAD_ON_CLICK' }
  | { type: 'VIEW_MENU_FORCE_RELOAD_ON_CLICK' }
  | { type: 'VIEW_MENU_TOGGLE_DEV_TOOLS_ON_CLICK' };
