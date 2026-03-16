import type { SetState } from '../types';

/** Store a draft text value for in-progress variable edits (for validation display). */
export function setThemeVariableDraftText(setState: SetState, key: string, value: string): void {
  setState({ type: 'SET_THEME_VARIABLE_DRAFT_TEXT', key, value });
}

