import { delay, inject, singleton } from 'tsyringe';
import { AppActions } from './app-action-type';
import { AppBarHandler } from '../components/app-bar/actions/app-bar-handler';
import { isAppBarAction } from '../components/app-bar/actions/app-bar-action-guard';
import { AppEyedropperOverlayHandler } from '../components/eyedropper-overlay/actions/app-eyedropper-overlay-handler';
import { isAppEyedropperOverlayAction } from '../components/eyedropper-overlay/actions/app-eyedropper-overlay-action-guard';
import { AppMenuHandler } from '../components/menu-bar/actions/app-menu-handler';
import { isAppMenuAction } from '../components/menu-bar/actions/app-menu-action-guard';
import { AppRibbonHandler } from '../components/ribbon/actions/app-ribbon-handler';
import { isAppRibbonAction } from '../components/ribbon/actions/app-ribbon-action-guard';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

@singleton()
export class AppActionHandler {
  private readonly log: Logger;

  constructor(
    loggerFactory: LoggerFactory,
    @inject(delay(() => AppBarHandler)) private readonly appBarHandler: AppBarHandler,
    @inject(delay(() => AppEyedropperOverlayHandler)) private readonly appEyedropperOverlayHandler: AppEyedropperOverlayHandler,
    @inject(delay(() => AppMenuHandler)) private readonly appMenuHandler: AppMenuHandler,
    @inject(delay(() => AppRibbonHandler)) private readonly appRibbonHandler: AppRibbonHandler,
  ) {
    this.log = loggerFactory.create(AppActionHandler.name);
  }

  async handle(action: AppActions): Promise<void> {
    if (isAppBarAction(action)) {
      return this.appBarHandler.handle(action);
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
