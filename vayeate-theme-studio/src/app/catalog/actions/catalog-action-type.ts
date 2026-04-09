import {
  CatalogName,
  CatalogType,
  SemanticTokenRegistryListKind,
  SourceType,
  TokenType,
  Version,
  TokenKey,
} from "../../../model/schemas";

export enum CatalogActionType {
  CatalogPageOnLoad = 'CATALOG_PAGE_ON_LOAD',
  CatalogCatalogsListOnCommit = 'CATALOG_CATALOGS_LIST_ON_COMMIT',
  CatalogCatalogsCreateButtonOnClick = 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK',
  CatalogCreateDialogNameTextOnChange = 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  CatalogCreateDialogTypeListOnCommit = 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT',
  CatalogCreateDialogCancelButtonOnClick = 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  CatalogCreateDialogOkButtonOnClick = 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
  CatalogDetailsSourceUrlTextOnCommit = 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_COMMIT',
  CatalogDetailsSourceTokenTypeListOnCommit = 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT',
  CatalogDetailsSourceTypeListOnCommit = 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT',
  CatalogDetailsSourceRemoveButtonOnClick = 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK',
  CatalogDetailsNewSourceUrlTextOnChange = 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE',
  CatalogDetailsNewSourceTokenTypeListOnCommit = 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT',
  CatalogDetailsNewSourceTypeListOnCommit = 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT',
  CatalogDetailsNewSourceAddButtonOnClick = 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK',
  CatalogDetailsDeleteVersionButtonOnClick = 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  CatalogDetailsSyncButtonOnClick = 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK',
  CatalogDetailsLockButtonOnClick = 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK',
  CatalogDetailsRevertButtonOnClick = 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK',
  CatalogTokensSearchTextOnChange = 'CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE',
  CatalogTokensBulkAddButtonOnClick = 'CATALOG_TOKENS_BULK_ADD_BUTTON_ON_CLICK',
  CatalogBulkAddTokensTextOnChange = 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE',
  CatalogBulkAddTokensCancelButtonOnClick = 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK',
  CatalogBulkAddTokensOkButtonOnClick = 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK',
  CatalogTokensExistingTokenKeyTextOnCommit = 'CATALOG_TOKENS_EXISTING_TOKEN_KEY_TEXT_ON_COMMIT',
  CatalogTokensTokenRemoveButtonOnClick = 'CATALOG_TOKENS_TOKEN_REMOVE_BUTTON_ON_CLICK',
  CatalogTokensNewTokenKeyTextOnChange = 'CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE',
  CatalogTokensNewTokenAddButtonOnClick = 'CATALOG_TOKENS_NEW_TOKEN_ADD_BUTTON_ON_CLICK',
  CatalogTokensNewSemanticTokenSelectorTextOnChange = 'CATALOG_TOKENS_NEW_SEMANTIC_TOKEN_SELECTOR_TEXT_ON_CHANGE',
  CatalogTokensNewSemanticTokenSelectorAddButtonOnClick = 'CATALOG_TOKENS_NEW_SEMANTIC_TOKEN_SELECTOR_ADD_BUTTON_ON_CLICK',
  CatalogTokensExistingSemanticTokenTextOnCommit = 'CATALOG_TOKENS_EXISTING_SEMANTIC_TOKEN_TEXT_ON_COMMIT',
  CatalogTokensExistingSemanticTokenRemoveButtonOnClick = 'CATALOG_TOKENS_EXISTING_SEMANTIC_TOKEN_REMOVE_BUTTON_ON_CLICK',
}

export type CatalogActions =
  | { type: CatalogActionType.CatalogPageOnLoad }
  | { type: CatalogActionType.CatalogCatalogsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogActionType.CatalogCatalogsCreateButtonOnClick }
  | { type: CatalogActionType.CatalogCreateDialogNameTextOnChange; value: string }
  | { type: CatalogActionType.CatalogCreateDialogTypeListOnCommit; value: CatalogType }
  | { type: CatalogActionType.CatalogCreateDialogCancelButtonOnClick }
  | { type: CatalogActionType.CatalogCreateDialogOkButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsSourceUrlTextOnCommit; value: string; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit; value: TokenType; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceTypeListOnCommit; value: SourceType; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick; sourceIndex: number }
  | { type: CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange; value: string }
  | { type: CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit; value: TokenType }
  | { type: CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit; value: SourceType }
  | { type: CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsSyncButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsLockButtonOnClick }
  | { type: CatalogActionType.CatalogDetailsRevertButtonOnClick }
  | { type: CatalogActionType.CatalogTokensSearchTextOnChange; value: string }
  | { type: CatalogActionType.CatalogTokensBulkAddButtonOnClick }
  | { type: CatalogActionType.CatalogBulkAddTokensTextOnChange; value: string }
  | { type: CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick }
  | { type: CatalogActionType.CatalogBulkAddTokensOkButtonOnClick }
  | { type: CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit; value: string; key: TokenKey; tokenType: TokenType }
  | { type: CatalogActionType.CatalogTokensTokenRemoveButtonOnClick; key: TokenKey; tokenType: TokenType }
  | { type: CatalogActionType.CatalogTokensNewTokenKeyTextOnChange; value: string }
  | { type: CatalogActionType.CatalogTokensNewTokenAddButtonOnClick; tokenType: TokenType; key?: string }
  | { type: CatalogActionType.CatalogTokensNewSemanticTokenSelectorTextOnChange; value: string }
  | { type: CatalogActionType.CatalogTokensNewSemanticTokenSelectorAddButtonOnClick }
  | {
      type: CatalogActionType.CatalogTokensExistingSemanticTokenTextOnCommit;
      registryList: SemanticTokenRegistryListKind;
      index: number;
      value: string;
    }
  | {
      type: CatalogActionType.CatalogTokensExistingSemanticTokenRemoveButtonOnClick;
      registryList: SemanticTokenRegistryListKind;
      index: number;
    };
