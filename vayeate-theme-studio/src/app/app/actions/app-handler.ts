import { delay, inject, singleton } from 'tsyringe';
import { AppActions } from './app-action-type';
import { AppShellHandler } from '../app-shell/actions/app-shell-handler';
import { isAppShellAction } from '../app-shell/actions/app-shell-action-type';
import { AppEyedropperOverlayHandler } from '../../common/eyedropper-overlay/actions/app-eyedropper-overlay-handler';
import { isAppEyedropperOverlayAction } from '../../common/eyedropper-overlay/actions/app-eyedropper-overlay-action-type';
import { AppMenuHandler } from '../menu-bar/actions/app-menu-handler';
import { isAppMenuAction } from '../menu-bar/actions/app-menu-action-type';
import { AppRibbonHandler } from '../ribbon/actions/app-ribbon-handler';
import { isAppRibbonAction } from '../ribbon/actions/app-ribbon-action-type';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

@singleton()
export class AppActionHandler {
  private readonly log: Logger;

  constructor(
    loggerFactory: LoggerFactory,
    @inject(delay(() => AppShellHandler)) private readonly appShellHandler: AppShellHandler,
    @inject(delay(() => AppEyedropperOverlayHandler)) private readonly appEyedropperOverlayHandler: AppEyedropperOverlayHandler,
    @inject(delay(() => AppMenuHandler)) private readonly appMenuHandler: AppMenuHandler,
    @inject(delay(() => AppRibbonHandler)) private readonly appRibbonHandler: AppRibbonHandler,
  ) {
    this.log = loggerFactory.create(AppActionHandler.name);
  }

  async handle(action: AppActions): Promise<void> {
    if (isAppShellAction(action)) {
      return this.appShellHandler.handle(action);
    }

    if (isAppEyedropperOverlayAction(action)) {
      return this.appEyedropperOverlayHandler.handle(action);
    }

    if (isAppMenuAction(action)) {
      return this.appMenuHandler.handle(action);
    }

    if (isAppRibbonAction(action)) {
      return this.appRibbonHandler.handle(action);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppAction union not exhaustive)', { action: _exhaustive });
  }
}
