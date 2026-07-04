import { delay, inject, singleton } from 'tsyringe';
import { AppActions } from './app-action-type';
import { AppShellHandler } from './app-shell/app-shell-handler';
import { isAppShellAction } from './app-shell/app-shell-action-type';
import { EyedropperOverlayHandler } from './eyedropper-overlay/eyedropper-overlay-handler';
import { isAppEyedropperOverlayAction } from './eyedropper-overlay/eyedropper-overlay-action-type';
import { StyledTooltipHandler } from './styled-tooltip/styled-tooltip-handler';
import { isAppStyledTooltipAction } from './styled-tooltip/styled-tooltip-action-type';
import { AppMenuHandler } from './menu-bar/app-menu-handler';
import { isAppMenuAction } from './menu-bar/app-menu-action-type';
import { AppRibbonHandler } from './ribbon/app-ribbon-handler';
import { isAppRibbonAction } from './ribbon/app-ribbon-action-type';
import { Logger, LoggerFactory } from '../../../domain/utils/Common/logger';

/**
 * Root app action handler that delegates to feature handlers by action subdomain.
 */
@singleton()
export class AppActionHandler {
  private readonly log: Logger;

  constructor(
    loggerFactory: LoggerFactory,
    @inject(delay(() => AppShellHandler)) private readonly appShellHandler: AppShellHandler,
    @inject(delay(() => EyedropperOverlayHandler)) private readonly appEyedropperOverlayHandler: EyedropperOverlayHandler,
    @inject(delay(() => StyledTooltipHandler)) private readonly appStyledTooltipHandler: StyledTooltipHandler,
    @inject(delay(() => AppMenuHandler)) private readonly appMenuHandler: AppMenuHandler,
    @inject(delay(() => AppRibbonHandler)) private readonly appRibbonHandler: AppRibbonHandler,
  ) {
    this.log = loggerFactory.create(AppActionHandler.name);
  }

  /**
   * Routes one app action to the matching feature handler.
   * @param action App-scoped action to handle; must be a member of {@link AppActions}.
   */
  async handle(action: AppActions): Promise<void> {
    if (isAppShellAction(action)) {
      return this.appShellHandler.handle(action);
    }

    if (isAppEyedropperOverlayAction(action)) {
      return this.appEyedropperOverlayHandler.handle(action);
    }

    if (isAppStyledTooltipAction(action)) {
      return this.appStyledTooltipHandler.handle(action);
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
