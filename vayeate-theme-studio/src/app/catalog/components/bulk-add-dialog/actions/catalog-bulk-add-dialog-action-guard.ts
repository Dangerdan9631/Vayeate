import { AppAction } from "../../../../core/actions/app-action";
import { CatalogBulkAddDialogActions, CatalogBulkAddDialogActionType } from "./catalog-bulk-add-dialog-action-type";

const catalogBulkAddDialogTypes = new Set<string>(Object.values(CatalogBulkAddDialogActionType));

export function isCatalogBulkAddDialogAction(a: AppAction): a is CatalogBulkAddDialogActions {
  return catalogBulkAddDialogTypes.has(a.type);
}
