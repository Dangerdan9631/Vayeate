import { singleton } from 'tsyringe';
import { LoadThemePageController } from '../controllers/load-theme-page-controller';
import { ClearThemeSaveErrorController } from '../controllers/clear-theme-save-error-controller';
import { Logger, LoggerFactory } from '../../../../../domain/utils/logger';
import { ThemePageActions, ThemePageActionType } from './theme-page-action-type';

@singleton()
export class ThemePageHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadThemePage: LoadThemePageController,
    private readonly clearThemeSaveError: ClearThemeSaveErrorController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(ThemePageHandler.name);
  }

  async handle(action: ThemePageActions): Promise<void> {
    switch (action.type) {
      case ThemePageActionType.PageOnLoad:
        return this.loadThemePage.run();
      case ThemePageActionType.PageSaveErrorDismissButtonOnClick:
        return this.clearThemeSaveError.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemePageAction union not exhaustive)', { action: _exhaustive });
  }
}
