import * as appController from '../../domain/controllers/app-controller';
import * as undoController from '../../domain/controllers/undo-controller';
import * as tabController from '../../domain/controllers/tab-controller';
import * as windowController from '../../domain/controllers/window-controller';
import type { ActionHandler, AppAction, HandlerDeps } from './handler-types';
import { AppActionType } from '../actions/action-types';
import { container } from 'tsyringe';

export const handleAppAction: ActionHandler<AppAction> = async (
  action: AppAction,
  _deps: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case AppActionType.AppAppOnLoad:
      await container.resolve(appController.LoadApplicationController).run();
      break;
    case AppActionType.AppAppOnClose:
      await container.resolve(appController.UnloadApplicationController).run();
      break;
    case AppActionType.AppFileMenuExitButtonOnClick:
      await container.resolve(windowController.CloseWindowController).run();
      break;
    case AppActionType.AppEditMenuUndoButtonOnClick:
      await container.resolve(undoController.PerformUndoController).run();
      break;
    case AppActionType.AppEditMenuRedoButtonOnClick:
      await container.resolve(undoController.PerformRedoController).run();
      break;
    case AppActionType.AppHistoryMenuGoToButtonOnClick:
      await container.resolve(undoController.PerformHistoryGoToController).run(action.frameId);
      break;
    case AppActionType.AppViewMenuReloadButtonOnClick:
      await container.resolve(windowController.ReloadWindowController).run();
      break;
    case AppActionType.AppViewMenuForceReloadButtonOnClick:
      await container.resolve(windowController.ForceReloadWindowController).run();
      break;
    case AppActionType.AppViewMenuToggleDevToolsButtonOnClick:
      await container.resolve(windowController.ToggleDevToolsController).run();
      break;
    case AppActionType.AppRibbonTabButtonOnClick:
      await container.resolve(tabController.SetActiveTabController).run(action.tabId);
      break;
    case AppActionType.AppBarThemeCheckboxOnToggle: {
      // checked = current dark-mode toggle (true when theme is dark); next scheme is the opposite
      const scheme: 'light' | 'dark' = action.checked ? 'light' : 'dark';
      await container.resolve(appController.SetColorSchemeController).run(scheme);
      break;
    }
    case AppActionType.AppBarMinimizeButtonOnClick:
      await container.resolve(windowController.MinimizeWindowController).run();
      break;
    case AppActionType.AppBarMaximizeButtonOnClick:
      await container.resolve(windowController.MaximizeWindowController).run();
      break;
    case AppActionType.AppBarCloseButtonOnClick:
      await container.resolve(windowController.CloseWindowController).run();
      break;
    case AppActionType.AppBarTitleBarOnDrag:
      await container.resolve(windowController.DragWindowController).run();
      break;
  }
};
