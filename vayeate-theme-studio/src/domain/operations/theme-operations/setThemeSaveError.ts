import type { SetState } from './types';

export function setThemeSaveError(setState: SetState, error: string | null): void {
  setState({ type: 'SET_THEME_SAVE_ERROR', error });
}
