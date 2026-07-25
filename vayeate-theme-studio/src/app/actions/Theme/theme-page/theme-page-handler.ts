import { singleton } from 'tsyringe';
import { LoadThemePageController } from '../../../controllers/Theme/theme-page/load-theme-page-controller';
import { UnloadThemePageController } from '../../../controllers/Theme/theme-page/unload-theme-page-controller';
import { ClearThemeSaveErrorController } from '../../../controllers/Theme/theme-page/clear-theme-save-error-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/Common/logger';
import { ThemePageActions, ThemePageActionType } from './theme-page-action-type';

/**
 * Routes Theme Page actions to their controllers.
 */
@singleton()
export class ThemePageHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadThemePage: LoadThemePageController,
    private readonly unloadThemePage: UnloadThemePageController,
    private readonly clearThemeSaveError: ClearThemeSaveErrorController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(ThemePageHandler.name);
  }

  /**
 * Dispatches the action to the matching controller.
 * @param action Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async handle(action: ThemePageActions): Promise<void> {
    switch (action.type) {
      case ThemePageActionType.PageOnLoad:
        return this.loadThemePage.run();
      case ThemePageActionType.PageOnUnload:
        return this.unloadThemePage.run();
      case ThemePageActionType.PageSaveErrorDismissButtonOnClick:
        return this.clearThemeSaveError.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemePageAction union not exhaustive)', { action: _exhaustive });
  }
}
