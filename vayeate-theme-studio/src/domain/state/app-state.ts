import type { TemplatesState } from './template/templates-state';
import { initialTemplatesState } from './template/templates-state';
import type { ThemesState } from './theme/themes-state';
import { initialThemesState } from './theme/themes-state';

export interface AppState {
  templates: TemplatesState;
  themes: ThemesState;
}

export const initialAppState: AppState = {
  templates: initialTemplatesState,
  themes: initialThemesState,
};
