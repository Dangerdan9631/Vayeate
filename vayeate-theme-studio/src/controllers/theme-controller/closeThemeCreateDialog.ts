import {
  setThemeCreateFormName,
  type SetState,
} from '../../operations/theme-operations';

export function closeThemeCreateDialog(setState: SetState): void {
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
  setThemeCreateFormName(setState, '');
}
