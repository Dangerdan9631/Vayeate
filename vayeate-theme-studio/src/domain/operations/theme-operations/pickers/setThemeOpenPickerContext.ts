import type { SetState } from '../types';

/** Set the active color picker context key (identifies which picker is open). Pass null to close. */
export function setThemeOpenPickerContext(setState: SetState, context: string | null): void {
  setState({ type: 'SET_THEME_OPEN_PICKER_CONTEXT', context });
}

