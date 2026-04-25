import { singleton } from 'tsyringe';
import { CloseWindowController } from '../../window/controllers/close-window-controller';
import { PerformHistoryGoToController } from '../../../../core/controllers/perform-history-go-to-controller';
import { PerformRedoController } from '../../../../core/controllers/perform-redo-controller';
import { PerformUndoController } from '../../../../core/controllers/perform-undo-controller';
import { ForceReloadWindowController } from '../../app-shell/controllers/force-reload-window-controller';
import { ReloadWindowController } from '../../app-shell/controllers/reload-window-controller';
import { ToggleDevToolsController } from '../../app-shell/controllers/toggle-dev-tools-controller';
import { CloseAllMenusController } from '../controllers/close-all-menus-controller';
import { ToggleMenuOpenController } from '../controllers/toggle-menu-open-controller';
import { Logger, LoggerFactory } from '../../../../../domain/utils/logger';
import { AppMenuActions, AppMenuActionType } from './app-menu-action-type';

@singleton()
export class AppMenuHandler {
  private readonly log: Logger;

  constructor(
    private readonly closeWindow: CloseWindowController,
    private readonly closeAllMenus: CloseAllMenusController,
    private readonly performUndo: PerformUndoController,
    private readonly performRedo: PerformRedoController,
    private readonly performHistoryGoTo: PerformHistoryGoToController,
    private readonly reloadWindow: ReloadWindowController,
    private readonly forceReloadWindow: ForceReloadWindowController,
    private readonly toggleDevTools: ToggleDevToolsController,
    private readonly toggleMenuOpen: ToggleMenuOpenController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(AppMenuHandler.name);
  }

  async handle(action: AppMenuActions): Promise<void> {
    switch (action.type) {
      case AppMenuActionType.FileMenuTriggerButtonOnClick:
        return this.toggleMenuOpen.run('file');
      case AppMenuActionType.FileMenuExitButtonOnClick:
        return this.closeWindow.run();
      case AppMenuActionType.EditMenuTriggerButtonOnClick:
        return this.toggleMenuOpen.run('edit');
      case AppMenuActionType.EditMenuUndoButtonOnClick:
        return this.performUndo.run();
      case AppMenuActionType.EditMenuRedoButtonOnClick:
        return this.performRedo.run();
      case AppMenuActionType.HistoryMenuTriggerButtonOnClick:
        return this.toggleMenuOpen.run('history');
      case AppMenuActionType.HistoryMenuGoToButtonOnClick:
        return this.performHistoryGoTo.run(action.frameId);
      case AppMenuActionType.ViewMenuTriggerButtonOnClick:
        return this.toggleMenuOpen.run('view');
      case AppMenuActionType.ViewMenuReloadButtonOnClick:
        return this.reloadWindow.run();
      case AppMenuActionType.ViewMenuForceReloadButtonOnClick:
        return this.forceReloadWindow.run();
      case AppMenuActionType.ViewMenuToggleDevToolsButtonOnClick:
        return this.toggleDevTools.run();
      case AppMenuActionType.MenuOnClose:
        return this.closeAllMenus.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppMenuAction union not exhaustive)', { action: _exhaustive });
  }
}
