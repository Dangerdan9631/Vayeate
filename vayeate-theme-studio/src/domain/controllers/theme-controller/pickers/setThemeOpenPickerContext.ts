import { setThemeOpenPickerContext as setThemeOpenPickerContextOp, type SetState } from '../../../operations/theme-operations';

/** Set the active color picker context key (identifies which picker is open). Pass null to close. */
export function setThemeOpenPickerContext(setState: SetState, context: string | null): void {
  setThemeOpenPickerContextOp(setState, context);
}

