import { setThemeHueReferenceHex as setThemeHueReferenceHexOp, type SetState } from '../../../operations/theme-operations';

export function setThemeHueReferenceHex(setState: SetState, value: string): void {
  setThemeHueReferenceHexOp(setState, value);
}

