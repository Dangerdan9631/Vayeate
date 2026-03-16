import type { Theme } from '../../../../model/schemas';
import type { SetState } from '../types';

export function setTheme(
  setState: SetState,
  theme: Theme | null,
  preserveHue?: boolean,
): void {
  setState({ type: 'SET_THEME', theme, preserveHue });
}



