import type { SetState } from './types';

/** Set selected preview sample key for scrolling (THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT). */
export function setThemePreviewSelectedSampleKey(setState: SetState, value: string): void {
  setState({ type: 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', value });
}
