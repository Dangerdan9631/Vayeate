import type { SetState } from '../types';

export function setThemeCreateFormName(setState: SetState, value: string): void {
  setState({ type: 'SET_THEME_CREATE_FORM_NAME', value });
}

