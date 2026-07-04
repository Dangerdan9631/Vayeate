import { delay, inject, singleton } from 'tsyringe';
import { LoggerFactory, type Logger } from '../../../../domain/utils/Common/logger';
import type { AppAction } from './app-action';
import { AppActionHandler } from '../../../actions/Common/app-handler';
import { isAppAction } from '../../../actions/Common/app-action-type';
import { CatalogActionHandler } from '../../../actions/Catalog/catalog-handler';
import { isCatalogAction } from '../../../actions/Catalog/catalog-action-type';
import { TemplateActionHandler } from '../../../actions/Template/template-handler';
import { isTemplateAction } from '../../../actions/Template/template-action-type';
import { ThemeActionHandler } from '../../../actions/Theme/theme-handler';
import { isThemeAction } from '../../../actions/Theme/theme-action-type';
import { EyedropperOverlayActionType } from '../../../actions/Common/eyedropper-overlay/eyedropper-overlay-action-type';
import { StyledTooltipActionType } from '../../../actions/Common/styled-tooltip/styled-tooltip-action-type';

const SILENCED_ACTION_TYPES = new Set<string>([
  EyedropperOverlayActionType.OverlayViewportSizeChange,
  EyedropperOverlayActionType.OverlayMouseMove,
  StyledTooltipActionType.TooltipOnPositionChange,
  StyledTooltipActionType.TooltipSourceOnMouseOut,
  StyledTooltipActionType.TooltipSourceOnMouseOver,
]);

/**
 * Routes a dequeued `AppAction` to the matching feature handler based on its discriminant.
 */
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
