import type { TabId } from '../../../model/tab-id';
import type { HexColor } from "../../../model/schema/primitives";

export enum AppActionType {
  AppMenubarUndoMenuOnLoad = 'APP_MENUBAR_UNDO_MENU_SYNC',
  AppFileMenuTriggerButtonOnClick = 'APP_FILE_MENU_TRIGGER_BUTTON_ON_CLICK',
  AppFileMenuExitButtonOnClick = 'APP_FILE_MENU_EXIT_BUTTON_ON_CLICK',
  AppEditMenuTriggerButtonOnClick = 'APP_EDIT_MENU_TRIGGER_BUTTON_ON_CLICK',
  AppEditMenuUndoButtonOnClick = 'APP_EDIT_MENU_UNDO_BUTTON_ON_CLICK',
  AppEditMenuRedoButtonOnClick = 'APP_EDIT_MENU_REDO_BUTTON_ON_CLICK',
  AppHistoryMenuTriggerButtonOnClick = 'APP_HISTORY_MENU_TRIGGER_BUTTON_ON_CLICK',
  AppHistoryMenuGoToButtonOnClick = 'APP_HISTORY_MENU_GO_TO_BUTTON_ON_CLICK',
  AppViewMenuTriggerButtonOnClick = 'APP_VIEW_MENU_TRIGGER_BUTTON_ON_CLICK',
  AppViewMenuReloadButtonOnClick = 'APP_VIEW_MENU_RELOAD_BUTTON_ON_CLICK',
  AppViewMenuForceReloadButtonOnClick = 'APP_VIEW_MENU_FORCE_RELOAD_BUTTON_ON_CLICK',
  AppViewMenuToggleDevToolsButtonOnClick = 'APP_VIEW_MENU_TOGGLE_DEV_TOOLS_BUTTON_ON_CLICK',
  AppMenuOnClose = 'APP_MENU_ON_CLOSE',
  AppRibbonTabButtonOnClick = 'APP_RIBBON_TAB_BUTTON_ON_CLICK',
  AppBarThemeCheckboxOnToggle = 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE',
  AppBarMinimizeButtonOnClick = 'APP_BAR_MINIMIZE_BUTTON_ON_CLICK',
  AppBarMaximizeButtonOnClick = 'APP_BAR_MAXIMIZE_BUTTON_ON_CLICK',
  AppBarRestoreButtonOnClick = 'APP_BAR_RESTORE_BUTTON_ON_CLICK',
  AppBarCloseButtonOnClick = 'APP_BAR_CLOSE_BUTTON_ON_CLICK',
  AppBarTitleBarOnDrag = 'APP_BAR_TITLE_BAR_ON_DRAG',
  AppEyedropperOverlayCancelButtonOnClick = 'APP_EYEDROPPER_OVERLAY_CANCEL_BUTTON_ON_CLICK',
  AppEyedropperOverlayColorPickCommitButtonOnClick = 'APP_EYEDROPPER_OVERLAY_COLOR_PICK_COMMIT_BUTTON_ON_CLICK',
}

export type AppActions =
  | { type: AppActionType.AppMenubarUndoMenuOnLoad }
  | { type: AppActionType.AppFileMenuTriggerButtonOnClick }
  | { type: AppActionType.AppFileMenuExitButtonOnClick }
  | { type: AppActionType.AppEditMenuTriggerButtonOnClick }
  | { type: AppActionType.AppEditMenuUndoButtonOnClick }
  | { type: AppActionType.AppEditMenuRedoButtonOnClick }
  | { type: AppActionType.AppHistoryMenuTriggerButtonOnClick }
  | { type: AppActionType.AppHistoryMenuGoToButtonOnClick; frameId: string }
  | { type: AppActionType.AppViewMenuTriggerButtonOnClick }
  | { type: AppActionType.AppViewMenuReloadButtonOnClick }
  | { type: AppActionType.AppViewMenuForceReloadButtonOnClick }
  | { type: AppActionType.AppViewMenuToggleDevToolsButtonOnClick }
  | { type: AppActionType.AppMenuOnClose }
  | { type: AppActionType.AppRibbonTabButtonOnClick; tabId: TabId }
  | { type: AppActionType.AppBarThemeCheckboxOnToggle }
  | { type: AppActionType.AppBarMinimizeButtonOnClick }
  | { type: AppActionType.AppBarMaximizeButtonOnClick }
  | { type: AppActionType.AppBarRestoreButtonOnClick }
  | { type: AppActionType.AppBarCloseButtonOnClick }
  | { type: AppActionType.AppBarTitleBarOnDrag }
  | { type: AppActionType.AppEyedropperOverlayCancelButtonOnClick }
  | { type: AppActionType.AppEyedropperOverlayColorPickCommitButtonOnClick; hex: HexColor };