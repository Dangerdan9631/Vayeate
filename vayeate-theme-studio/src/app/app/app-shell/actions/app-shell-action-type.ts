import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type strings for app shell controls and lifecycle events.
 */
export enum AppShellActionType {
  PageOnLoad = 'APP_SHELL_PAGE_ON_LOAD',
  PageOnUnload = 'APP_SHELL_PAGE_ON_UNLOAD',
  ThemeCheckboxOnToggle = 'APP_SHELL_THEME_CHECKBOX_ON_TOGGLE',
  MinimizeButtonOnClick = 'APP_SHELL_MINIMIZE_BUTTON_ON_CLICK',
  MaximizeButtonOnClick = 'APP_SHELL_MAXIMIZE_BUTTON_ON_CLICK',
  RestoreButtonOnClick = 'APP_SHELL_RESTORE_BUTTON_ON_CLICK',
  CloseButtonOnClick = 'APP_SHELL_CLOSE_BUTTON_ON_CLICK',
  TitleBarOnDrag = 'APP_SHELL_TITLE_BAR_ON_DRAG',
}

/**
 * Discriminated union of app shell actions dispatched from shell chrome.
 */
export type AppShellActions =
  | { type: AppShellActionType.PageOnLoad }
  | { type: AppShellActionType.PageOnUnload }
  | { type: AppShellActionType.ThemeCheckboxOnToggle }
  | { type: AppShellActionType.MinimizeButtonOnClick }
  | { type: AppShellActionType.MaximizeButtonOnClick }
  | { type: AppShellActionType.RestoreButtonOnClick }
  | { type: AppShellActionType.CloseButtonOnClick }
  | { type: AppShellActionType.TitleBarOnDrag };


/**
 * Set of shell action type strings used by the {@link isAppShellAction} guard.
 */
const appShellTypes = new Set<string>(Object.values(AppShellActionType));

/**
 * Narrows a queued action to an app shell action when its type is shell-scoped.
 * @param a Action from the global action queue.
 * @returns True when the action belongs to {@link AppShellActions}.
 */
export function isAppShellAction(a: AppAction): a is AppShellActions {
  return appShellTypes.has(a.type);
}
