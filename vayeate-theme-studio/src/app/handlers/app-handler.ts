import * as appController from '../../domain/controllers/app-controller';
import * as undoController from '../../domain/controllers/undo-controller';
import * as tabController from '../../domain/controllers/tab-controller';
import * as windowController from '../../domain/controllers/window-controller';
import type { ActionHandler, AppAction, HandlerDeps } from './handler-types';

export const handleAppAction: ActionHandler<AppAction> = async (
  action: AppAction,
  { setState, getState, setUiState, setStoreState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case 'APP_APP_ON_LOAD':
      // Load or restore persisted app preferences (e.g. window size, last tab).
      // Initialize refs and any lazy state needed for the current tab.
      await appController.loadApplication(setState, setStoreState);
      break;
    case 'APP_APP_ON_CLOSE':
      // Persist app state (preferences, window bounds) to disk if needed.
      await appController.unloadApplication(setState);
      break;
    case 'APP_FILE_MENU_EXIT_BUTTON_ON_CLICK':
      await windowController.closeWindow();
      break;
    case 'APP_EDIT_MENU_UNDO_BUTTON_ON_CLICK':
      await undoController.performUndo(setState, getState);
      break;
    case 'APP_EDIT_MENU_REDO_BUTTON_ON_CLICK':
      await undoController.performRedo(setState, getState);
      break;
    case 'APP_HISTORY_MENU_GO_TO_BUTTON_ON_CLICK':
      await undoController.performHistoryGoTo(setState, getState, action.frameId);
      break;
    case 'APP_VIEW_MENU_RELOAD_BUTTON_ON_CLICK':
      await windowController.reloadWindow();
      break;
    case 'APP_VIEW_MENU_FORCE_RELOAD_BUTTON_ON_CLICK':
      await windowController.forceReloadWindow();
      break;
    case 'APP_VIEW_MENU_TOGGLE_DEV_TOOLS_BUTTON_ON_CLICK':
      await windowController.toggleDevTools();
      break;
    case 'APP_RIBBON_TAB_BUTTON_ON_CLICK':
      tabController.setActiveTab(setUiState, action.tabId);
      break;
    case 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE': {
      // action.checked = current state (true = dark), so toggle to the opposite
      const scheme: 'light' | 'dark' = action.checked ? 'light' : 'dark';
      setUiState({ type: 'SET_UI_COLOR_SCHEME', scheme });
      await window.electronAPI?.saveConfig?.({ colorScheme: scheme });
      break;
    }
    case 'APP_BAR_MINIMIZE_BUTTON_ON_CLICK':
      await windowController.minimizeWindow(getState);
      break;
    case 'APP_BAR_MAXIMIZE_BUTTON_ON_CLICK':
      await windowController.maximizeWindow(getState);
      break;
    case 'APP_BAR_CLOSE_BUTTON_ON_CLICK':
      await windowController.closeWindow();
      break;
    case 'APP_BAR_TITLE_BAR_ON_DRAG':
      await windowController.dragWindow();
      break;
  }
};
