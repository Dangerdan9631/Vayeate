import {
  setThemeCreateFormName,
  type SetState,
} from '../../operations/theme-operations';

export function openThemeCreateDialog(setState: SetState): void {
  setThemeCreateFormName(setState, '');
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: true });
}
