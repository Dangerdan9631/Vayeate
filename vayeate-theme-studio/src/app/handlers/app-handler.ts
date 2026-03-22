import { injectable } from 'tsyringe';
import {
  LoadApplicationController,
  SetColorSchemeController,
  UnloadApplicationController,
} from '../../domain/controllers/app-controller';
import {
  PerformHistoryGoToController,
  PerformRedoController,
  PerformUndoController,
} from '../../domain/controllers/undo-controller';
import { SetActiveTabController } from '../../domain/controllers/tab-controller';
import {
  CloseWindowController,
  DragWindowController,
  ForceReloadWindowController,
  MaximizeWindowController,
  MinimizeWindowController,
  ReloadWindowController,
  ToggleDevToolsController,
} from '../../domain/controllers/window-controller';
import type { ActionHandler, AppAction, HandlerDeps } from './handler-types';
import { AppActionType } from '../actions/action-types';

@injectable()
export class AppActionHandler implements ActionHandler<AppAction> {
  constructor(
    private readonly loadApplication: LoadApplicationController,
    private readonly unloadApplication: UnloadApplicationController,
    private readonly closeWindow: CloseWindowController,
    private readonly performUndo: PerformUndoController,
    private readonly performRedo: PerformRedoController,
    private readonly performHistoryGoTo: PerformHistoryGoToController,
    private readonly reloadWindow: ReloadWindowController,
    private readonly forceReloadWindow: ForceReloadWindowController,
    private readonly toggleDevTools: ToggleDevToolsController,
    private readonly setActiveTab: SetActiveTabController,
    private readonly setColorScheme: SetColorSchemeController,
    private readonly minimizeWindow: MinimizeWindowController,
    private readonly maximizeWindow: MaximizeWindowController,
    private readonly dragWindow: DragWindowController,
  ) {}

  async handle(action: AppAction, _deps: HandlerDeps): Promise<void> {
    switch (action.type) {
      case AppActionType.AppAppOnLoad:
        await this.loadApplication.run();
        break;
      case AppActionType.AppAppOnClose:
        await this.unloadApplication.run();
        break;
      case AppActionType.AppFileMenuExitButtonOnClick:
        await this.closeWindow.run();
        break;
      case AppActionType.AppEditMenuUndoButtonOnClick:
        await this.performUndo.run();
        break;
      case AppActionType.AppEditMenuRedoButtonOnClick:
        await this.performRedo.run();
        break;
      case AppActionType.AppHistoryMenuGoToButtonOnClick:
        await this.performHistoryGoTo.run(action.frameId);
        break;
      case AppActionType.AppViewMenuReloadButtonOnClick:
        await this.reloadWindow.run();
        break;
      case AppActionType.AppViewMenuForceReloadButtonOnClick:
        await this.forceReloadWindow.run();
        break;
      case AppActionType.AppViewMenuToggleDevToolsButtonOnClick:
        await this.toggleDevTools.run();
        break;
      case AppActionType.AppRibbonTabButtonOnClick:
        await this.setActiveTab.run(action.tabId);
        break;
      case AppActionType.AppBarThemeCheckboxOnToggle: {
        const scheme: 'light' | 'dark' = action.checked ? 'light' : 'dark';
        await this.setColorScheme.run(scheme);
        break;
      }
      case AppActionType.AppBarMinimizeButtonOnClick:
        await this.minimizeWindow.run();
        break;
      case AppActionType.AppBarMaximizeButtonOnClick:
        await this.maximizeWindow.run();
        break;
      case AppActionType.AppBarCloseButtonOnClick:
        await this.closeWindow.run();
        break;
      case AppActionType.AppBarTitleBarOnDrag:
        await this.dragWindow.run();
        break;
    }
  }
}
