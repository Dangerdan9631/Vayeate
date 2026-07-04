import { AppActions } from '../../../actions/Common/app-action-type';
import { CatalogActions } from '../../../actions/Catalog/catalog-action-type';
import { TemplateActions } from '../../../actions/Template/template-action-type';
import { ThemeActions } from '../../../actions/Theme/theme-action-type';

/**
 * Union of all UI-originated action types routed through the action queue.
 */
export type AppAction =
  | AppActions
  | CatalogActions
  | TemplateActions
  | ThemeActions;
