import { setThemeCreateFormName as setThemeCreateFormNameOp, type SetState } from '../../../operations/theme-operations';

export function setThemeCreateFormName(setState: SetState, value: string): void {
  setThemeCreateFormNameOp(setState, value);
}

