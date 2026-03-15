import { setThemePreviewVariableFilterText as setThemePreviewVariableFilterTextOp, type SetState } from '../../operations/theme-operations';

export function setPreviewVariableFilterText(setState: SetState, value: string): void {
  setThemePreviewVariableFilterTextOp(setState, value);
}
