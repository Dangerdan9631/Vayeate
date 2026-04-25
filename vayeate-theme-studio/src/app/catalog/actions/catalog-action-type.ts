import { CatalogCreateDialogActions } from "../create-dialog/actions/catalog-create-dialog-action-type";
import { CatalogsCardActions } from "../catalogs-card/actions/catalogs-card-action-type";
import { CatalogBulkAddDialogActions } from "../bulk-add-dialog/actions/catalog-bulk-add-dialog-action-type";
import { CatalogDetailsCardActions } from "../catalog-details-card/actions/catalog-details-card-action-type";
import { TokensCardActions } from "../tokens-card/actions/tokens-card-action-type";
import { CatalogPageActions } from "../catalog-page/actions/catalog-page-action-type";
import type { AppAction } from '../../core/action-queue/app-action';
import { isCatalogBulkAddDialogAction } from '../bulk-add-dialog/actions/catalog-bulk-add-dialog-action-type';
import { isCatalogCreateDialogAction } from '../create-dialog/actions/catalog-create-dialog-action-type';
import { isCatalogDetailsCardAction } from '../catalog-details-card/actions/catalog-details-card-action-type';
import { isCatalogsCardAction } from '../catalogs-card/actions/catalogs-card-action-type';
import { isTokensCardAction } from '../tokens-card/actions/tokens-card-action-type';
import { isCatalogPageAction } from '../catalog-page/actions/catalog-page-action-type';

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
