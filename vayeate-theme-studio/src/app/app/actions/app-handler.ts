import { singleton } from 'tsyringe';
import {
  CloseAllMenusController,
  SetActiveTabController,
  ToggleColorSchemeController,
  ToggleMenuOpenController,
} from '../../../domain/controllers/app-controller';
import {
  PerformHistoryGoToController,
  PerformRedoController,
  PerformUndoController,
} from '../../../domain/controllers/undo-controller';
import {
  CloseWindowController,
  DragWindowController,
  ForceReloadWindowController,
  MaximizeWindowController,
  MinimizeWindowController,
  ReloadWindowController,
  ToggleDevToolsController,
} from '../../../domain/controllers/window-controller';
import { CloseEyedropperOverlayController } from '../../../domain/controllers/theme-controller/eyedropper/close-eyedropper-overlay-controller';
import { CommitEyedropperOverlayPickController } from '../../../domain/controllers/theme-controller/eyedropper/commit-eyedropper-overlay-pick-controller';
import { AppActions, AppActionType } from './app-action-type';

@singleton()
export class AppActionHandler {
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
    private readonly toggleColorScheme: ToggleColorSchemeController,
    private readonly minimizeWindow: MinimizeWindowController,
    private readonly maximizeWindow: MaximizeWindowController,
    private readonly dragWindow: DragWindowController,
    private readonly closeEyedropperOverlay: CloseEyedropperOverlayController,
    private readonly commitEyedropperOverlayPick: CommitEyedropperOverlayPickController,
  ) {}

  async handle(action: AppActions): Promise<void> {
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
      case AppActionType.AppBarThemeCheckboxOnToggle:
        await this.toggleColorScheme.run();
        break;
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
      case AppActionType.AppEyedropperOverlayCancelButtonOnClick:
        this.closeEyedropperOverlay.run();
        break;
      case AppActionType.AppEyedropperOverlayColorPickCommitButtonOnClick:
        this.commitEyedropperOverlayPick.run(action.hex);
        break;
    }
  }
}
