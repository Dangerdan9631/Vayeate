import { AppAction } from "../../../core/action-queue/app-action";

export enum CatalogBulkAddDialogActionType {
  TextOnChange = 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE',
  CancelButtonOnClick = 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK',
  OkButtonOnClick = 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK',
}

export type CatalogBulkAddDialogActions =
  | { type: CatalogBulkAddDialogActionType.TextOnChange; value: string }
  | { type: CatalogBulkAddDialogActionType.CancelButtonOnClick }
  | { type: CatalogBulkAddDialogActionType.OkButtonOnClick };


const catalogBulkAddDialogTypes = new Set<string>(Object.values(CatalogBulkAddDialogActionType));

export function isCatalogBulkAddDialogAction(a: AppAction): a is CatalogBulkAddDialogActions {
  return catalogBulkAddDialogTypes.has(a.type);
}
