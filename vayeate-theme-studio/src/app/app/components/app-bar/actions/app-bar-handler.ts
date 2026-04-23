import { singleton } from 'tsyringe';
import { CloseWindowController } from '../../../../common/controllers/close-window-controller';
import { DragWindowController } from '../../../../common/controllers/drag-window-controller';
import { MaximizeWindowController } from '../../../../common/controllers/maximize-window-controller';
import { MinimizeWindowController } from '../../../../common/controllers/minimize-window-controller';
import { RestoreWindowController } from '../../../../common/controllers/restore-window-controller';
import { ToggleColorSchemeController } from '../../../controllers/toggle-color-scheme-controller';
import { Logger, LoggerFactory } from '../../../../../domain/utils/logger';
import { AppBarActions, AppBarActionType } from './app-bar-action-type';

@singleton()
export class AppBarHandler {
  private readonly log: Logger;

  constructor(
    private readonly closeWindow: CloseWindowController,
    private readonly toggleColorScheme: ToggleColorSchemeController,
    private readonly minimizeWindow: MinimizeWindowController,
    private readonly maximizeWindow: MaximizeWindowController,
    private readonly dragWindow: DragWindowController,
    private readonly restoreWindow: RestoreWindowController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(AppBarHandler.name);
  }

  async handle(action: AppBarActions): Promise<void> {
    switch (action.type) {
      case AppBarActionType.ThemeCheckboxOnToggle:
        return this.toggleColorScheme.run();
      case AppBarActionType.MinimizeButtonOnClick:
        return this.minimizeWindow.run();
      case AppBarActionType.MaximizeButtonOnClick:
        return this.maximizeWindow.run();
      case AppBarActionType.RestoreButtonOnClick:
        return this.restoreWindow.run();
      case AppBarActionType.CloseButtonOnClick:
        return this.closeWindow.run();
      case AppBarActionType.TitleBarOnDrag:
        return this.dragWindow.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppBarAction union not exhaustive)', { action: _exhaustive });
  }
}
