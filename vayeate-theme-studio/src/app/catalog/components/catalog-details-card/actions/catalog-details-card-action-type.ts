import { SourceType, TokenType } from "../../../../../model/schema/primitives";

export enum CatalogDetailsCardActionType {
  SourceUrlTextOnCommit = 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_COMMIT',
  SourceTokenTypeListOnCommit = 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT',
  SourceTypeListOnCommit = 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT',
  SourceRemoveButtonOnClick = 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK',
  NewSourceUrlTextOnChange = 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE',
  NewSourceTokenTypeListOnCommit = 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT',
  NewSourceTypeListOnCommit = 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT',
  NewSourceAddButtonOnClick = 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK',
  DeleteVersionButtonOnClick = 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  SyncButtonOnClick = 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK',
  LockButtonOnClick = 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK',
  RevertButtonOnClick = 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK',
}

export type CatalogDetailsCardActions =
  | { type: CatalogDetailsCardActionType.SourceUrlTextOnCommit; value: string; sourceIndex: number }
  | { type: CatalogDetailsCardActionType.SourceTokenTypeListOnCommit; value: TokenType; sourceIndex: number }
  | { type: CatalogDetailsCardActionType.SourceTypeListOnCommit; value: SourceType; sourceIndex: number }
  | { type: CatalogDetailsCardActionType.SourceRemoveButtonOnClick; sourceIndex: number }
  | { type: CatalogDetailsCardActionType.NewSourceUrlTextOnChange; value: string }
  | { type: CatalogDetailsCardActionType.NewSourceTokenTypeListOnCommit; value: TokenType }
  | { type: CatalogDetailsCardActionType.NewSourceTypeListOnCommit; value: SourceType }
  | { type: CatalogDetailsCardActionType.NewSourceAddButtonOnClick }
  | { type: CatalogDetailsCardActionType.DeleteVersionButtonOnClick }
  | { type: CatalogDetailsCardActionType.SyncButtonOnClick }
  | { type: CatalogDetailsCardActionType.LockButtonOnClick }
  | { type: CatalogDetailsCardActionType.RevertButtonOnClick };
