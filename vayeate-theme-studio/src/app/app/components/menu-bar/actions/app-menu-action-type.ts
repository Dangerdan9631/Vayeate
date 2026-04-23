import type { AppAction } from '../../../../core/actions/app-action';

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


const appMenuTypes = new Set<string>(Object.values(AppMenuActionType));

export function isAppMenuAction(a: AppAction): a is AppMenuActions {
  return appMenuTypes.has(a.type);
}
