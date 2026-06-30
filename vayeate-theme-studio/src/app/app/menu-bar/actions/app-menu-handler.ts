import { singleton } from 'tsyringe';
import { CloseWindowController } from '../../window/controllers/close-window-controller';
import { HistoryGoToController } from '../../../core/undo/history-go-to-controller';
import { RedoController } from '../../../core/undo/redo-controller';
import { UndoController } from '../../../core/undo/undo-controller';
import { ForceReloadWindowController } from '../../app-shell/controllers/force-reload-window-controller';
import { ReloadWindowController } from '../../app-shell/controllers/reload-window-controller';
import { ToggleDevToolsController } from '../../app-shell/controllers/toggle-dev-tools-controller';
import { CloseAllMenusController } from '../controllers/close-all-menus-controller';
import { ToggleMenuOpenController } from '../controllers/toggle-menu-open-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { AppMenuActions, AppMenuActionType } from './app-menu-action-type';

/**
 * Routes menu bar actions to menu, undo, history, and view controllers.
 */
@singleton()
export class AppMenuHandler {
  private readonly log: Logger;

  constructor(
    private readonly closeWindow: CloseWindowController,
    private readonly closeAllMenus: CloseAllMenusController,
    private readonly performUndo: UndoController,
    private readonly performRedo: RedoController,
    private readonly performHistoryGoTo: HistoryGoToController,
    private readonly reloadWindow: ReloadWindowController,
    private readonly forceReloadWindow: ForceReloadWindowController,
    private readonly toggleDevTools: ToggleDevToolsController,
    private readonly toggleMenuOpen: ToggleMenuOpenController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(AppMenuHandler.name);
  }

  /**
   * Dispatches one menu bar action to its controller entry point.
   * @param action Menu action to handle; must be a member of {@link AppMenuActions}.
   */
  async handle(action: AppMenuActions): Promise<void> {
    switch (action.type) {
      case AppMenuActionType.FileMenuTriggerButtonOnClick:
        return this.toggleMenuOpen.run('file');
      case AppMenuActionType.FileMenuExitButtonOnClick:
        return this.closeWindow.run();
      case AppMenuActionType.EditMenuTriggerButtonOnClick:
        return this.toggleMenuOpen.run('edit');
      case AppMenuActionType.EditMenuUndoButtonOnClick:
        await this.performUndo.run();
        return;
      case AppMenuActionType.EditMenuRedoButtonOnClick:
        await this.performRedo.run();
        return;
      case AppMenuActionType.HistoryMenuTriggerButtonOnClick:
        return this.toggleMenuOpen.run('history');
      case AppMenuActionType.HistoryMenuGoToButtonOnClick:
        await this.performHistoryGoTo.run(action.frameId);
        return;
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
