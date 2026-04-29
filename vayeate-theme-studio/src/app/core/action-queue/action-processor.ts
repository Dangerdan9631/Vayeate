import { delay, inject, singleton } from 'tsyringe';
import { LoggerFactory, type Logger } from '../../../domain/utils/logger';
import type { AppAction } from './app-action';
import { AppActionHandler } from '../../app/actions/app-handler';
import { isAppAction } from '../../app/actions/app-action-type';
import { CatalogActionHandler } from '../../catalog/actions/catalog-handler';
import { isCatalogAction } from '../../catalog/actions/catalog-action-type';
import { TemplateActionHandler } from '../../template/actions/template-handler';
import { isTemplateAction } from '../../template/actions/template-action-type';
import { ThemeActionHandler } from '../../theme/actions/theme-handler';
import { isThemeAction } from '../../theme/actions/theme-action-type';
import { EyedropperOverlayActionType } from '../../common/eyedropper-overlay/actions/eyedropper-overlay-action-type';

const SILENCED_ACTION_TYPES = new Set<string>([
  EyedropperOverlayActionType.OverlayViewportSizeChange,
  EyedropperOverlayActionType.OverlayMouseMove,
]);

@singleton()
export class ActionProcessor {
  private readonly log: Logger;

  constructor(
    @inject(delay(() => AppActionHandler)) private readonly appHandler: AppActionHandler,
    @inject(delay(() => CatalogActionHandler)) private readonly catalogHandler: CatalogActionHandler,
    @inject(delay(() => TemplateActionHandler)) private readonly templateHandler: TemplateActionHandler,
    @inject(delay(() => ThemeActionHandler)) private readonly themeHandler: ThemeActionHandler,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create('ActionProcessor');
  }

  async process(action: AppAction): Promise<void> {
    if (!SILENCED_ACTION_TYPES.has(action.type)) {
      this.log.debug('action', action);
    }

    if (isAppAction(action)) {
      await this.appHandler.handle(action);
      return;
    }
    if (isCatalogAction(action)) {
      await this.catalogHandler.handle(action);
      return;
    }
    if (isTemplateAction(action)) {
      await this.templateHandler.handle(action);
      return;
    }
    if (isThemeAction(action)) {
      await this.themeHandler.handle(action);
      return;
    }
    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppAction union not exhaustive)', { action: _exhaustive });
  }
}
