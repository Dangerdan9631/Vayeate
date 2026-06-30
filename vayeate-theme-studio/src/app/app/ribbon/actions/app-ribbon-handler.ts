import { singleton } from 'tsyringe';
import { SetActiveTabController } from '../controllers/set-active-tab-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { AppRibbonActions, AppRibbonActionType } from './app-ribbon-action-type';

/**
 * Routes ribbon tab actions to the active-tab controller.
 */
@singleton()
export class AppRibbonHandler {
  private readonly log: Logger;

  constructor(
    private readonly setActiveTab: SetActiveTabController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(AppRibbonHandler.name);
  }

  /**
   * Dispatches one ribbon action to its controller entry point.
   * @param action Ribbon action to handle; must be a member of {@link AppRibbonActions}.
   */
  async handle(action: AppRibbonActions): Promise<void> {
    switch (action.type) {
      case AppRibbonActionType.TabButtonOnClick:
        return this.setActiveTab.run(action.tabId);
    }

    this.log.error('Unhandled action (AppRibbonAction union not exhaustive)', { action });
  }
}
