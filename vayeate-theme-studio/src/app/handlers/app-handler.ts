import { injectable } from 'tsyringe';
import {
  CloseAllMenusController,
  SetActiveTabController,
  SetColorSchemeController,
  ToggleMenuOpenController,
} from '../../domain/controllers/app-controller';
import {
  PerformHistoryGoToController,
  PerformRedoController,
  PerformUndoController,
} from '../../domain/controllers/undo-controller';
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
    private readonly closeWindow: CloseWindowController,
    private readonly closeAllMenus: CloseAllMenusController,
    private readonly performUndo: PerformUndoController,
    private readonly performRedo: PerformRedoController,
    private readonly performHistoryGoTo: PerformHistoryGoToController,
    private readonly reloadWindow: ReloadWindowController,
    private readonly forceReloadWindow: ForceReloadWindowController,
    private readonly toggleDevTools: ToggleDevToolsController,
    private readonly setActiveTab: SetActiveTabController,
    private readonly toggleMenuOpen: ToggleMenuOpenController,
    private readonly setColorScheme: SetColorSchemeController,
    private readonly minimizeWindow: MinimizeWindowController,
    private readonly maximizeWindow: MaximizeWindowController,
    private readonly dragWindow: DragWindowController,
  ) {}

  async handle(action: AppAction, _deps: HandlerDeps): Promise<void> {
    switch (action.type) {
      case AppActionType.AppFileMenuTriggerButtonOnClick:
        this.toggleMenuOpen.run('file');
        break;
      case AppActionType.AppFileMenuExitButtonOnClick:
        await this.closeWindow.run();
        break;
      case AppActionType.AppEditMenuTriggerButtonOnClick:
        this.toggleMenuOpen.run('edit');
        break;
      case AppActionType.AppEditMenuUndoButtonOnClick:
        await this.performUndo.run();
        break;
      case AppActionType.AppEditMenuRedoButtonOnClick:
        await this.performRedo.run();
        break;
      case AppActionType.AppHistoryMenuTriggerButtonOnClick:
        this.toggleMenuOpen.run('history');
        break;
      case AppActionType.AppHistoryMenuGoToButtonOnClick:
        await this.performHistoryGoTo.run(action.frameId);
        break;
      case AppActionType.AppViewMenuTriggerButtonOnClick:
        this.toggleMenuOpen.run('view');
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
      case AppActionType.AppMenuOnClose:
        this.closeAllMenus.run();
        break;
      case AppActionType.AppRibbonTabButtonOnClick:
        await this.setActiveTab.run(action.tabId);
        break;
      case AppActionType.AppBarThemeCheckboxOnToggle: {
        const scheme = action.checked ? 'light' : 'dark';
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
