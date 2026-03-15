import { setThemePreviewVariableFilterClear as setThemePreviewVariableFilterClearOp, type SetState } from '../../operations/theme-operations';

export function clearPreviewVariableFilter(setState: SetState): void {
  setThemePreviewVariableFilterClearOp(setState);
}
