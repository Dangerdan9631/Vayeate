import type { AppAction } from '../../../../core/actions/app-action';

export enum AppShellActionType {
  ThemeCheckboxOnToggle = 'APP_SHELL_THEME_CHECKBOX_ON_TOGGLE',
  MinimizeButtonOnClick = 'APP_SHELL_MINIMIZE_BUTTON_ON_CLICK',
  MaximizeButtonOnClick = 'APP_SHELL_MAXIMIZE_BUTTON_ON_CLICK',
  RestoreButtonOnClick = 'APP_SHELL_RESTORE_BUTTON_ON_CLICK',
  CloseButtonOnClick = 'APP_SHELL_CLOSE_BUTTON_ON_CLICK',
  TitleBarOnDrag = 'APP_SHELL_TITLE_BAR_ON_DRAG',
}

export type AppShellActions =
  | { type: AppShellActionType.ThemeCheckboxOnToggle }
  | { type: AppShellActionType.MinimizeButtonOnClick }
  | { type: AppShellActionType.MaximizeButtonOnClick }
  | { type: AppShellActionType.RestoreButtonOnClick }
  | { type: AppShellActionType.CloseButtonOnClick }
  | { type: AppShellActionType.TitleBarOnDrag };


const appShellTypes = new Set<string>(Object.values(AppShellActionType));

export function isAppShellAction(a: AppAction): a is AppShellActions {
  return appShellTypes.has(a.type);
}
