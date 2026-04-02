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
