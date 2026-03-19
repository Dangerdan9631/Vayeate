import type { SetState } from '../../../operations/theme-operations';
import { setThemeHueAdjustment } from './setThemeHueAdjustment';
import { setThemeHueReferenceHex } from './setThemeHueReferenceHex';

export function commitHueReferenceColor(setState: SetState, value: string): void {
  setThemeHueReferenceHex(setState, value);
  setThemeHueAdjustment(setState, 0);
}

