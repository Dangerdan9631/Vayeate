import { setThemeVariableDraftText as setThemeVariableDraftTextOp, type SetState } from '../../operations/theme-operations';

/** Store a draft text value for in-progress variable edits (for validation display). */
export function setThemeVariableDraftText(setState: SetState, key: string, value: string): void {
  setThemeVariableDraftTextOp(setState, key, value);
}
