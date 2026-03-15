import type { SetState } from './types';

/** Clear preview variable list filter (THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK). */
export function setThemePreviewVariableFilterClear(setState: SetState): void {
  setState({ type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', value: '' });
}
