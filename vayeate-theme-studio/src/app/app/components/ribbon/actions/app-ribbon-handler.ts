import { singleton } from 'tsyringe';
import { SetActiveTabController } from '../../../controllers/set-active-tab-controller';
import { Logger, LoggerFactory } from '../../../../../domain/utils/logger';
import { AppRibbonActions, AppRibbonActionType } from './app-ribbon-action-type';

@singleton()
export class AppRibbonHandler {
  private readonly log: Logger;

  constructor(
    private readonly setActiveTab: SetActiveTabController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(AppRibbonHandler.name);
  }

  async handle(action: AppRibbonActions): Promise<void> {
    switch (action.type) {
      case AppRibbonActionType.TabButtonOnClick:
        return this.setActiveTab.run(action.tabId);
    }

    this.log.error('Unhandled action (AppRibbonAction union not exhaustive)', { action });
  }
}
