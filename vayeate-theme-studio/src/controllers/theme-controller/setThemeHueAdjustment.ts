import { setThemeHueAdjustment as setThemeHueAdjustmentOp, type SetState } from '../../operations/theme-operations';

export function setThemeHueAdjustment(setState: SetState, value: number): void {
  setThemeHueAdjustmentOp(setState, value);
}
