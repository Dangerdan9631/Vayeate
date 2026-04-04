import { AppActions } from '../../app/actions/app-action-type';
import { CatalogActions } from '../../catalog/actions/catalog-action-type';
import { TemplateActions } from '../../template/actions/template-action-type';
import { ThemeActions } from '../../theme/actions/theme-action-type';

export type AppAction =
  | AppActions
  | CatalogActions
  | TemplateActions
  | ThemeActions;