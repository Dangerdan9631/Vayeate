import { singleton } from 'tsyringe';
import { CloseEyedropperOverlayController } from '../../theme/controllers/close-eyedropper-overlay-controller';
import { CommitEyedropperOverlayPickController } from '../../theme/controllers/commit-eyedropper-overlay-pick-controller';
import { AppActions, AppActionType } from './app-action-type';
import { CloseAllMenusController } from '../controllers/close-all-menus-controller';
import { SetActiveTabController } from '../controllers/set-active-tab-controller';
import { ToggleColorSchemeController } from '../controllers/toggle-color-scheme-controller';
import { ToggleMenuOpenController } from '../controllers/toggle-menu-open-controller';
import { PerformHistoryGoToController } from '../../core/controllers/perform-history-go-to-controller';
import { PerformRedoController } from '../../core/controllers/perform-redo-controller';
import { PerformUndoController } from '../../core/controllers/perform-undo-controller';
import { CloseWindowController } from '../../common/controllers/close-window-controller';
import { DragWindowController } from '../../common/controllers/drag-window-controller';
import { ForceReloadWindowController } from '../../common/controllers/force-reload-window-controller';
import { MaximizeWindowController } from '../../common/controllers/maximize-window-controller';
import { MinimizeWindowController } from '../../common/controllers/minimize-window-controller';
import { ReloadWindowController } from '../../common/controllers/reload-window-controller';
import { RestoreWindowController } from '../../common/controllers/restore-window-controller';
import { ToggleDevToolsController } from '../../common/controllers/toggle-dev-tools-controller';

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
    private readonly restoreWindow: RestoreWindowController,
    private readonly closeEyedropperOverlay: CloseEyedropperOverlayController,
    private readonly commitEyedropperOverlayPick: CommitEyedropperOverlayPickController,
  ) {}

  async handle(action: AppActions): Promise<void> {
    switch (action.type) {
      case AppActionType.AppFileMenuTriggerButtonOnClick:
        await this.toggleMenuOpen.run('file');
        break;
      case AppActionType.AppFileMenuExitButtonOnClick:
        await this.closeWindow.run();
        break;
      case AppActionType.AppEditMenuTriggerButtonOnClick:
        await this.toggleMenuOpen.run('edit');
        break;
      case AppActionType.AppEditMenuUndoButtonOnClick:
        await this.performUndo.run();
        break;
      case AppActionType.AppEditMenuRedoButtonOnClick:
        await this.performRedo.run();
        break;
      case AppActionType.AppHistoryMenuTriggerButtonOnClick:
        await this.toggleMenuOpen.run('history');
        break;
      case AppActionType.AppHistoryMenuGoToButtonOnClick:
        await this.performHistoryGoTo.run(action.frameId);
        break;
      case AppActionType.AppViewMenuTriggerButtonOnClick:
        await this.toggleMenuOpen.run('view');
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
        await this.closeAllMenus.run();
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
      case AppActionType.AppBarRestoreButtonOnClick:
        await this.restoreWindow.run();
        break;
      case AppActionType.AppBarCloseButtonOnClick:
        await this.closeWindow.run();
        break;
      case AppActionType.AppBarTitleBarOnDrag:
        await this.dragWindow.run();
        break;
      case AppActionType.AppEyedropperOverlayCancelButtonOnClick:
        await this.closeEyedropperOverlay.run();
        break;
      case AppActionType.AppEyedropperOverlayColorPickCommitButtonOnClick:
        await this.commitEyedropperOverlayPick.run(action.hex);
        break;
    }
  }
}
