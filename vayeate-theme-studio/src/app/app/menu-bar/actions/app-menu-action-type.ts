import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type strings for menu bar dropdowns and commands.
 */
export enum AppMenuActionType {
  FileMenuTriggerButtonOnClick = 'APP_FILE_MENU_TRIGGER_BUTTON_ON_CLICK',
  FileMenuExitButtonOnClick = 'APP_FILE_MENU_EXIT_BUTTON_ON_CLICK',
  EditMenuTriggerButtonOnClick = 'APP_EDIT_MENU_TRIGGER_BUTTON_ON_CLICK',
  EditMenuUndoButtonOnClick = 'APP_EDIT_MENU_UNDO_BUTTON_ON_CLICK',
  EditMenuRedoButtonOnClick = 'APP_EDIT_MENU_REDO_BUTTON_ON_CLICK',
  HistoryMenuTriggerButtonOnClick = 'APP_HISTORY_MENU_TRIGGER_BUTTON_ON_CLICK',
  HistoryMenuGoToButtonOnClick = 'APP_HISTORY_MENU_GO_TO_BUTTON_ON_CLICK',
  ViewMenuTriggerButtonOnClick = 'APP_VIEW_MENU_TRIGGER_BUTTON_ON_CLICK',
  ViewMenuReloadButtonOnClick = 'APP_VIEW_MENU_RELOAD_BUTTON_ON_CLICK',
  ViewMenuForceReloadButtonOnClick = 'APP_VIEW_MENU_FORCE_RELOAD_BUTTON_ON_CLICK',
  ViewMenuToggleDevToolsButtonOnClick = 'APP_VIEW_MENU_TOGGLE_DEV_TOOLS_BUTTON_ON_CLICK',
  MenuOnClose = 'APP_MENU_ON_CLOSE',
}

/**
 * Discriminated union of menu bar actions dispatched from the header menus.
 */
export type AppMenuActions =
  | { type: AppMenuActionType.FileMenuTriggerButtonOnClick }
  | { type: AppMenuActionType.FileMenuExitButtonOnClick }
  | { type: AppMenuActionType.EditMenuTriggerButtonOnClick }
  | { type: AppMenuActionType.EditMenuUndoButtonOnClick }
  | { type: AppMenuActionType.EditMenuRedoButtonOnClick }
  | { type: AppMenuActionType.HistoryMenuTriggerButtonOnClick }
  | { type: AppMenuActionType.HistoryMenuGoToButtonOnClick; frameId: string }
  | { type: AppMenuActionType.ViewMenuTriggerButtonOnClick }
  | { type: AppMenuActionType.ViewMenuReloadButtonOnClick }
  | { type: AppMenuActionType.ViewMenuForceReloadButtonOnClick }
  | { type: AppMenuActionType.ViewMenuToggleDevToolsButtonOnClick }
  | { type: AppMenuActionType.MenuOnClose };


/**
 * Set of menu action type strings used by the {@link isAppMenuAction} guard.
 */
const appMenuTypes = new Set<string>(Object.values(AppMenuActionType));

/**
 * Narrows a queued action to a menu bar action when its type is menu-scoped.
 * @param a Action from the global action queue.
 * @returns True when the action belongs to {@link AppMenuActions}.
 */
export function isAppMenuAction(a: AppAction): a is AppMenuActions {
  return appMenuTypes.has(a.type);
}
