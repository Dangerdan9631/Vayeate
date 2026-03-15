import { setThemeSaveError, type SetState } from '../../operations/theme-operations';

export function clearThemeSaveError(setState: SetState): void {
  setThemeSaveError(setState, null);
}
