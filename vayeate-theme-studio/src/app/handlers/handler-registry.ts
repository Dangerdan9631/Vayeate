import { createLogger } from '../../domain/utils/logger';
import type { AppActionV2 } from '../actions/action-types';
import { handleAppAction } from './app-handler';
import { handleCatalogAction } from './catalog-handler';
import type { AppAction, CatalogAction, HandlerDeps, TemplateAction, ThemeAction } from './handler-types';
import { handleTemplateAction } from './template-handler';
import { handleThemeAction } from './theme-handler';

const log = createLogger('ActionProcessor');

export function createActionProcessor(
  deps: HandlerDeps,
): (action: AppActionV2) => Promise<void> {
  return async (action: AppActionV2): Promise<void> => {
    log.debug('action', action);
    const type = action.type;
    if (type.startsWith('APP_')) {
      await handleAppAction(action as AppAction, deps);
    } else if (type.startsWith('CATALOG_')) {
      await handleCatalogAction(action as CatalogAction, deps);
    } else if (type.startsWith('TEMPLATE_')) {
      await handleTemplateAction(action as TemplateAction, deps);
    } else if (type.startsWith('THEME_')) {
      await handleThemeAction(action as ThemeAction, deps);
    }
  };
}
