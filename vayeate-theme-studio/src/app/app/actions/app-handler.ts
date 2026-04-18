import { singleton } from 'tsyringe';
import { CloseEyedropperOverlayController } from '../../../domain/controllers/theme-controller/eyedropper/close-eyedropper-overlay-controller';
import { CommitEyedropperOverlayPickController } from '../../../domain/controllers/theme-controller/eyedropper/commit-eyedropper-overlay-pick-controller';
import { AppActions, AppActionType } from './app-action-type';
import { CloseAllMenusController } from '../../../domain/controllers/app-controller/close-all-menus-controller';
import { SetActiveTabController } from '../../../domain/controllers/app-controller/set-active-tab-controller';
import { LoadUndoHistoryController } from '../../../domain/controllers/app-controller/sync-undo-menu-state-controller';
import { ToggleColorSchemeController } from '../../../domain/controllers/app-controller/toggle-color-scheme-controller';
import { ToggleMenuOpenController } from '../../../domain/controllers/app-controller/toggle-menu-open-controller';
import { PerformHistoryGoToController } from '../../../domain/controllers/undo-controller/perform-history-go-to-controller';
import { PerformRedoController } from '../../../domain/controllers/undo-controller/perform-redo-controller';
import { PerformUndoController } from '../../../domain/controllers/undo-controller/perform-undo-controller';
import { CloseWindowController } from '../../../domain/controllers/window-controller/close-window-controller';
import { DragWindowController } from '../../../domain/controllers/window-controller/drag-window-controller';
import { ForceReloadWindowController } from '../../../domain/controllers/window-controller/force-reload-window-controller';
import { MaximizeWindowController } from '../../../domain/controllers/window-controller/maximize-window-controller';
import { MinimizeWindowController } from '../../../domain/controllers/window-controller/minimize-window-controller';
import { ReloadWindowController } from '../../../domain/controllers/window-controller/reload-window-controller';
import { RestoreWindowController } from '../../../domain/controllers/window-controller/restore-window-controller';
import { ToggleDevToolsController } from '../../../domain/controllers/window-controller/toggle-dev-tools-controller';

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
    private readonly loadUndoHistory: LoadUndoHistoryController,
  ) {}

  async handle(action: AppActions): Promise<void> {
    switch (action.type) {
      case AppActionType.AppMenubarUndoMenuOnLoad:
        await this.loadUndoHistory.run();
        break;
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
