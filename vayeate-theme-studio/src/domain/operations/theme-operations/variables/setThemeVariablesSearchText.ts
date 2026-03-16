import type { SetState } from '../types';

/** Set search filter text for the theme variables list. */
export function setThemeVariablesSearchText(setState: SetState, value: string): void {
  setState({ type: 'SET_THEME_VARIABLES_SEARCH_TEXT', value });
}

