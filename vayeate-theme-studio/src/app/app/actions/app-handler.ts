import { delay, inject, singleton } from 'tsyringe';
import { AppActions } from './app-action-type';
import { AppShellHandler } from '../app-shell/actions/app-shell-handler';
import { isAppShellAction } from '../app-shell/actions/app-shell-action-type';
import { EyedropperOverlayHandler } from '../../common/eyedropper-overlay/actions/eyedropper-overlay-handler';
import { isAppEyedropperOverlayAction } from '../../common/eyedropper-overlay/actions/eyedropper-overlay-action-type';
import { StyledTooltipHandler } from '../../common/styled-tooltip/actions/styled-tooltip-handler';
import { isAppStyledTooltipAction } from '../../common/styled-tooltip/actions/styled-tooltip-action-type';
import { AppMenuHandler } from '../menu-bar/actions/app-menu-handler';
import { isAppMenuAction } from '../menu-bar/actions/app-menu-action-type';
import { AppRibbonHandler } from '../ribbon/actions/app-ribbon-handler';
import { isAppRibbonAction } from '../ribbon/actions/app-ribbon-action-type';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

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
