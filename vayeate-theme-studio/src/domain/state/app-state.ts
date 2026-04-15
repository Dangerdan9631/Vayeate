import type { CatalogsState } from './catalog/catalogs-state';
import { initialCatalogsState } from './catalog/catalogs-state';
import type { TemplatesState } from './template/templates-state';
import { initialTemplatesState } from './template/templates-state';
import type { ThemesState } from './theme/themes-state';
import { initialThemesState } from './theme/themes-state';
import type { UndoStackState } from './undo-stack/undo-stack-state';
import { initialUndoStackState } from './undo-stack/undo-stack-state';

export interface AppState {
  catalogs: CatalogsState;
  templates: TemplatesState;
  themes: ThemesState;
  undoStack: UndoStackState;
}

export const initialAppState: AppState = {
  catalogs: initialCatalogsState,
  templates: initialTemplatesState,
  themes: initialThemesState,
  undoStack: initialUndoStackState,
};
