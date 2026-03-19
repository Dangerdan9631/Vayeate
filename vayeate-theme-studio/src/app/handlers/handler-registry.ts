import { createLogger } from '../../domain/utils/logger';
import type { AppActionV2 } from '../actions/action-types';
import { handleAppAction } from './app-handler';
import { handleCatalogAction } from './catalog-handler';
import type { HandlerDeps } from './handler-types';
import {
  isAppAction,
  isCatalogAction,
  isTemplateAction,
  isThemeAction,
} from './handler-types';
import { handleTemplateAction } from './template-handler';
import { handleThemeAction } from './theme-handler';

const log = createLogger('ActionProcessor');

export function createActionProcessor(
  deps: HandlerDeps,
): (action: AppActionV2) => Promise<void> {
  return async (action: AppActionV2): Promise<void> => {
    log.debug('action', action);
    if (isAppAction(action)) {
      await handleAppAction(action, deps);
    } else if (isCatalogAction(action)) {
      await handleCatalogAction(action, deps);
    } else if (isTemplateAction(action)) {
      await handleTemplateAction(action, deps);
    } else if (isThemeAction(action)) {
      await handleThemeAction(action, deps);
    }
  };
}
