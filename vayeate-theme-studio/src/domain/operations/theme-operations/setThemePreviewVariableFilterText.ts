import type { SetState } from './types';

/** Set preview variable list filter text (THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE). */
export function setThemePreviewVariableFilterText(setState: SetState, value: string): void {
  setState({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value });
}
