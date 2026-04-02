import { singleton } from 'tsyringe';
import { LoggerFactory, type Logger } from '../../domain/utils/logger';
import type { AppAction } from './action-types';
import { AppActionHandler } from './app-handler';
import { CatalogActionHandler } from './catalog-handler';
import {
  isAppAction,
  isCatalogAction,
  isTemplateAction,
  isThemeAction,
} from './handler-types';
import { TemplateActionHandler } from './template-handler';
import { ThemeActionHandler } from './theme-handler';

/** Routes each {@link AppAction} to the correct domain handler (injected). */
@singleton()
export class ActionProcessor {
  private readonly log: Logger;

  constructor(
    private readonly appHandler: AppActionHandler,
    private readonly catalogHandler: CatalogActionHandler,
    private readonly templateHandler: TemplateActionHandler,
    private readonly themeHandler: ThemeActionHandler,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('ActionProcessor');
  }

  async process(action: AppAction): Promise<void> {
    this.log.debug('action', action);
    if (isAppAction(action)) {
      await this.appHandler.handle(action);
    } else if (isCatalogAction(action)) {
      await this.catalogHandler.handle(action);
    } else if (isTemplateAction(action)) {
      await this.templateHandler.handle(action);
    } else if (isThemeAction(action)) {
      await this.themeHandler.handle(action);
    }
  }
}
