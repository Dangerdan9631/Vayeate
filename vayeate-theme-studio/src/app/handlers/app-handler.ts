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
      // Load or restore persisted app preferences (e.g. window size, last tab).
      // Initialize refs and any lazy state needed for the current tab.
      await appController.loadApplication(setState, setStoreState);
      break;
    case AppActionType.AppAppOnClose:
      // Persist app state (preferences, window bounds) to disk if needed.
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
    case AppActionType.AppBarThemeCheckboxOnToggle: {
      // action.checked = current state (true = dark), so toggle to the opposite
      const scheme: 'light' | 'dark' = action.checked ? 'light' : 'dark';
      setUiState({ type: 'SET_UI_COLOR_SCHEME', scheme });
      await appController.saveColorScheme(scheme);
      break;
    }
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
