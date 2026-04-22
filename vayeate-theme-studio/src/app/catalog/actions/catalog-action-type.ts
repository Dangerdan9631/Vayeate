import { CatalogCreateDialogActions } from "../components/create-dialog/actions/catalog-create-dialog-action-type";
import { CatalogsCardActions } from "../components/catalogs-card/actions/catalogs-card-action-type";
import { CatalogBulkAddDialogActions } from "../components/bulk-add-dialog/actions/catalog-bulk-add-dialog-action-type";
import { CatalogDetailsCardActions } from "../components/catalog-details-card/actions/catalog-details-card-action-type";
import { TokensCardActions } from "../components/tokens-card/actions/tokens-card-action-type";
import { CatalogPageActions } from "../components/catalog-page/actions/catalog-page-action-type";

export type CatalogActions =
  | CatalogPageActions
  | CatalogCreateDialogActions
  | CatalogsCardActions
  | CatalogBulkAddDialogActions
  | CatalogDetailsCardActions
  | TokensCardActions;
