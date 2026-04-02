import type { AppConfigState } from './app-config/app-config-state';
import { initialAppConfigState } from './app-config/app-config-state';
import type { CatalogsState } from './catalog/catalogs-state';
import { initialCatalogsState } from './catalog/catalogs-state';
import type { TemplatesState } from './template/templates-state';
import { initialTemplatesState } from './template/templates-state';
import type { ThemesState } from './theme/themes-state';
import { initialThemesState } from './theme/themes-state';
import type { UndoStackState } from './undo-stack/undo-stack-state';
import { initialUndoStackState } from './undo-stack/undo-stack-state';
import { initialUiState, type UiState } from './ui/ui-state';
import { initialWindowState, type WindowState } from './window/window-state';

export type { TabId } from './ui/ui-state';

// Re-export slice types for consumers that imported from app-state
export type { CatalogsState, CatalogEntry, CatalogStoreMap } from './catalog/catalogs-state';
export { getCatalogRefsFromCatalogMap, getCatalogRefsFromCatalogsState } from './catalog/catalogs-state';
export type { TemplatesState, TemplateEntry, TemplateStoreMap } from './template/templates-state';
export {
  getTemplateRefsFromTemplateMap,
  getTemplateRefsFromTemplatesState,
} from './template/templates-state';
export type { ThemesState, ThemeEntry, ThemeStoreMap, GenerateResult } from './theme/themes-state';
export { getThemeRefsFromThemeMap, getThemeRefsFromThemesState } from './theme/themes-state';
export type { AppConfigState } from './app-config/app-config-state';
export { initialAppConfigState } from './app-config/app-config-state';
export type { UndoStackState } from './undo-stack/undo-stack-state';
export { initialUndoStackState } from './undo-stack/undo-stack-state';

export type { MenuOpenState, UiState } from './ui/ui-state';
export { initialUiState } from './ui/ui-state';
export type { Position, Size, WindowLoadState, WindowState } from './window/window-state';
export { initialWindowState } from './window/window-state';

export interface AppState {
  catalogs: CatalogsState;
  templates: TemplatesState;
  themes: ThemesState;
  undoStack: UndoStackState;
  appConfig: AppConfigState;
  ui: UiState;
  window: WindowState;
}

export const initialAppState: AppState = {
  catalogs: initialCatalogsState,
  templates: initialTemplatesState,
  themes: initialThemesState,
  undoStack: initialUndoStackState,
  appConfig: initialAppConfigState,
  ui: initialUiState,
  window: initialWindowState,
};
