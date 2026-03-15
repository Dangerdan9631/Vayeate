import type { SetState } from './types';

export function setThemeHueAdjustment(setState: SetState, value: number): void {
  setState({ type: 'SET_THEME_HUE_ADJUSTMENT', value });
}
