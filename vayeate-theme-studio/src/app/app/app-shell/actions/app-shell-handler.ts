import { singleton } from 'tsyringe';
import { CloseWindowController } from '../../window/controllers/close-window-controller';
import { DragWindowController } from '../../window/controllers/drag-window-controller';
import { MaximizeWindowController } from '../../window/controllers/maximize-window-controller';
import { MinimizeWindowController } from '../../window/controllers/minimize-window-controller';
import { RestoreWindowController } from '../../window/controllers/restore-window-controller';
import { ToggleColorSchemeController } from '../controllers/toggle-color-scheme-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { AppShellActions, AppShellActionType } from './app-shell-action-type';
import { LoadAppController } from '../controllers/load-app-controller';
import { UnloadAppController } from '../controllers/unload-app-controller';

@singleton()
export class AppShellHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadApp: LoadAppController,
    private readonly unloadApp: UnloadAppController,
    private readonly closeWindow: CloseWindowController,
    private readonly toggleColorScheme: ToggleColorSchemeController,
    private readonly minimizeWindow: MinimizeWindowController,
    private readonly maximizeWindow: MaximizeWindowController,
    private readonly dragWindow: DragWindowController,
    private readonly restoreWindow: RestoreWindowController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(AppShellHandler.name);
  }

  async handle(action: AppShellActions): Promise<void> {
    switch (action.type) {
      case AppShellActionType.PageOnLoad:
        return this.loadApp.run();
      case AppShellActionType.PageOnUnload:
        return this.unloadApp.run();
      case AppShellActionType.ThemeCheckboxOnToggle:
        return this.toggleColorScheme.run();
      case AppShellActionType.MinimizeButtonOnClick:
        return this.minimizeWindow.run();
      case AppShellActionType.MaximizeButtonOnClick:
        return this.maximizeWindow.run();
      case AppShellActionType.RestoreButtonOnClick:
        return this.restoreWindow.run();
      case AppShellActionType.CloseButtonOnClick:
        return this.closeWindow.run();
      case AppShellActionType.TitleBarOnDrag:
        return this.dragWindow.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppShellAction union not exhaustive)', { action: _exhaustive });
  }
}
