import type { AppAction } from '../../core/actions/app-action';
import { isCatalogBulkAddDialogAction } from '../components/bulk-add-dialog/actions/catalog-bulk-add-dialog-action-guard';
import { isCatalogCreateDialogAction } from '../components/create-dialog/actions/catalog-create-dialog-action-guard';
import { isCatalogDetailsCardAction } from '../components/catalog-details-card/actions/catalog-details-card-action-guard';
import { isCatalogsCardAction } from '../components/catalogs-card/actions/catalogs-card-action-guard';
import { isTokensCardAction } from '../components/tokens-card/actions/tokens-card-action-guard';
import { isCatalogPageAction } from '../components/catalog-page/actions/catalog-page-action-guard';
import type { CatalogActions } from './catalog-action-type';

export function isCatalogAction(a: AppAction): a is CatalogActions {
  return isCatalogPageAction(a)
    || isCatalogBulkAddDialogAction(a)
    || isCatalogCreateDialogAction(a)
    || isCatalogDetailsCardAction(a)
    || isCatalogsCardAction(a)
    || isTokensCardAction(a);
}
