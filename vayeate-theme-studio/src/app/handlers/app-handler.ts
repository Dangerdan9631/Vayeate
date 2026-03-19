import * as appController from '../../domain/controllers/app-controller';
import * as undoController from '../../domain/controllers/undo-controller';
import * as tabController from '../../domain/controllers/tab-controller';
import * as windowController from '../../domain/controllers/window-controller';
import type { ActionHandler, AppAction, HandlerDeps } from './handler-types';
import { AppActionType } from '../actions/action-types';

export const handleAppAction: ActionHandler<AppAction> = async (
  action: AppAction,
  { setState, getState, setUiState, setStoreState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case AppActionType.AppAppOnLoad:
      await appController.loadApplication(setState, setStoreState);
      break;
    case AppActionType.AppAppOnClose:
      await appController.unloadApplication(setState);
      break;
    case AppActionType.AppFileMenuExitButtonOnClick:
      await windowController.closeWindow();
      break;
    case AppActionType.AppEditMenuUndoButtonOnClick:
      await undoController.performUndo(setState, getState);
      break;
    case AppActionType.AppEditMenuRedoButtonOnClick:
      await undoController.performRedo(setState, getState);
      break;
    case AppActionType.AppHistoryMenuGoToButtonOnClick:
      await undoController.performHistoryGoTo(setState, getState, action.frameId);
      break;
    case AppActionType.AppViewMenuReloadButtonOnClick:
      await windowController.reloadWindow();
      break;
    case AppActionType.AppViewMenuForceReloadButtonOnClick:
      await windowController.forceReloadWindow();
      break;
    case AppActionType.AppViewMenuToggleDevToolsButtonOnClick:
      await windowController.toggleDevTools();
      break;
    case AppActionType.AppRibbonTabButtonOnClick:
      tabController.setActiveTab(setUiState, action.tabId);
      break;
    case AppActionType.AppBarThemeCheckboxOnToggle:
      await appController.toggleColorScheme(setUiState, action.checked);
      break;
    case AppActionType.AppBarMinimizeButtonOnClick:
      await windowController.minimizeWindow(getState);
      break;
    case AppActionType.AppBarMaximizeButtonOnClick:
      await windowController.maximizeWindow(getState);
      break;
    case AppActionType.AppBarCloseButtonOnClick:
      await windowController.closeWindow();
      break;
    case AppActionType.AppBarTitleBarOnDrag:
      await windowController.dragWindow();
      break;
  }
};
