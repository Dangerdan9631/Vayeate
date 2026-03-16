import type { SetState } from '../types';

export function setThemeHueReferenceHex(setState: SetState, value: string): void {
  setState({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
}

