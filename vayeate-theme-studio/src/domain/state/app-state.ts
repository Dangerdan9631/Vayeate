import type { ThemesState } from './theme/themes-state';
import { initialThemesState } from './theme/themes-state';

export interface AppState {
  themes: ThemesState;
}

export const initialAppState: AppState = {
  themes: initialThemesState,
};
