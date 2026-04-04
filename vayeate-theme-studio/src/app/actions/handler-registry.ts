import { singleton } from 'tsyringe';
import { LoggerFactory, type Logger } from '../../domain/utils/logger';
import type { AppAction } from './app-action';
import { AppActionHandler } from './app/app-handler';
import { CatalogActionHandler } from './catalog/catalog-handler';
import {
  isAppAction,
  isCatalogAction,
  isTemplateAction,
  isThemeAction,
} from './handler-types';
import { TemplateActionHandler } from './template/template-handler';
import { ThemeActionHandler } from './theme/theme-handler';

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
