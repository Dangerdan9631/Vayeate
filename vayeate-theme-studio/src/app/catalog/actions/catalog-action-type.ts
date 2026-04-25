import { CatalogCreateDialogActions } from "../components/create-dialog/actions/catalog-create-dialog-action-type";
import { CatalogsCardActions } from "../components/catalogs-card/actions/catalogs-card-action-type";
import { CatalogBulkAddDialogActions } from "../components/bulk-add-dialog/actions/catalog-bulk-add-dialog-action-type";
import { CatalogDetailsCardActions } from "../components/catalog-details-card/actions/catalog-details-card-action-type";
import { TokensCardActions } from "../components/tokens-card/actions/tokens-card-action-type";
import { CatalogPageActions } from "../components/catalog-page/actions/catalog-page-action-type";
import type { AppAction } from '../../core/components/action-queue/app-action';
import { isCatalogBulkAddDialogAction } from '../components/bulk-add-dialog/actions/catalog-bulk-add-dialog-action-type';
import { isCatalogCreateDialogAction } from '../components/create-dialog/actions/catalog-create-dialog-action-type';
import { isCatalogDetailsCardAction } from '../components/catalog-details-card/actions/catalog-details-card-action-type';
import { isCatalogsCardAction } from '../components/catalogs-card/actions/catalogs-card-action-type';
import { isTokensCardAction } from '../components/tokens-card/actions/tokens-card-action-type';
import { isCatalogPageAction } from '../components/catalog-page/actions/catalog-page-action-type';

export type CatalogActions =
  | CatalogPageActions
  | CatalogCreateDialogActions
  | CatalogsCardActions
  | CatalogBulkAddDialogActions
  | CatalogDetailsCardActions
  | TokensCardActions;


export function isCatalogAction(a: AppAction): a is CatalogActions {
  return isCatalogPageAction(a)
    || isCatalogBulkAddDialogAction(a)
    || isCatalogCreateDialogAction(a)
    || isCatalogDetailsCardAction(a)
    || isCatalogsCardAction(a)
    || isTokensCardAction(a);
}
