import { setThemeVariablesSearchText as setThemeVariablesSearchTextOp, type SetState } from '../../operations/theme-operations';

export function setThemeVariablesSearchText(setState: SetState, value: string): void {
  setThemeVariablesSearchTextOp(setState, value);
}
