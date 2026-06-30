import { AppActions } from '../../app/actions/app-action-type';
import { CatalogActions } from '../../catalog/actions/catalog-action-type';
import { TemplateActions } from '../../template/actions/template-action-type';
import { ThemeActions } from '../../theme/actions/theme-action-type';

/**
 * Union of all UI-originated action types routed through the action queue.
 */
export type AppAction =
  | AppActions
  | CatalogActions
  | TemplateActions
  | ThemeActions;
