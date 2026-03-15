import * as catalogController from '../../domain/controllers/catalog-controller';
import {
  setCatalogBulkAddText,
  setCatalogCreateFormName,
  setCatalogCreateFormType,
  setCatalogNewSourceType,
  setCatalogNewSourceTokenType,
  setCatalogNewSourceUrl,
  setCatalogNewTokenKey,
  setCatalogTokensSearchText,
} from '../../domain/operations/catalog-operations';
import { setCurrentUndoStackId } from '../../domain/operations/undo-operations';
import type { ActionHandler, CatalogAction, HandlerDeps } from './handler-types';

export const handleCatalogAction: ActionHandler<CatalogAction> = async (
  action: CatalogAction,
  { setState, getState, setStoreState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case 'CATALOG_PAGE_ON_LOAD':
      await catalogController.loadCatalogRefs(setState, setStoreState);
      setCurrentUndoStackId(setState, null);
      break;
    case 'CATALOG_CATALOGS_LIST_ON_COMMIT':
      await catalogController.selectCatalogAndLoad(setState, action.name, action.version);
      break;
    case 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK':
      catalogController.openCatalogCreateDialog(setState);
      break;
    case 'CATALOG_CREATE_DIALOG_ON_OPEN':
      catalogController.openCatalogCreateDialog(setState);
      break;
    case 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE':
      setCatalogCreateFormName(setState, action.value);
      break;
    case 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT':
      setCatalogCreateFormType(setState, action.value);
      break;
    case 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK':
      catalogController.closeCatalogCreateDialog(setState);
      break;
    case 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK':
      await catalogController.createCatalog(setState, setStoreState, action.params);
      break;
    case 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK':
      await catalogController.deleteCatalogVersion(setState, setStoreState, action.name, action.version);
      break;
    case 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK':
      await catalogController.syncCatalog(setState, setStoreState, action.catalog);
      break;
    case 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK':
      await catalogController.lockCatalog(setState, setStoreState, getState);
      break;
    case 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK':
      await catalogController.revertCatalogToVersion(setState, setStoreState, action.name, action.version);
      break;
    case 'CATALOG_DETAILS_SAVE_CATALOG':
      await catalogController.saveCatalog(setState, setStoreState, action.catalog);
      break;
    case 'CATALOG_DETAILS_SOURCE_URL_TEXT_ON_COMMIT':
      await catalogController.updateSourceUrl(setState, setStoreState, getState, action.sourceIndex, action.value);
      break;
    case 'CATALOG_DETAILS_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT':
      await catalogController.updateSourceTokenType(setState, setStoreState, getState, action.sourceIndex, action.value);
      break;
    case 'CATALOG_DETAILS_SOURCE_TYPE_LIST_ON_COMMIT':
      await catalogController.updateSourceType(setState, setStoreState, getState, action.sourceIndex, action.value);
      break;
    case 'CATALOG_DETAILS_SOURCE_REMOVE_BUTTON_ON_CLICK':
      await catalogController.removeSource(setState, setStoreState, getState, action.sourceIndex);
      break;
    case 'CATALOG_DETAILS_NEW_SOURCE_URL_TEXT_ON_CHANGE':
      setCatalogNewSourceUrl(setState, action.value);
      break;
    case 'CATALOG_DETAILS_NEW_SOURCE_TOKEN_TYPE_LIST_ON_COMMIT':
      setCatalogNewSourceTokenType(setState, action.value);
      break;
    case 'CATALOG_DETAILS_NEW_SOURCE_TYPE_LIST_ON_COMMIT':
      setCatalogNewSourceType(setState, action.value);
      break;
    case 'CATALOG_DETAILS_NEW_SOURCE_ADD_BUTTON_ON_CLICK':
      await catalogController.addNewSource(setState, setStoreState, getState);
      break;
    case 'CATALOG_TOKENS_SEARCH_TEXT_ON_CHANGE':
      setCatalogTokensSearchText(setState, action.value);
      break;
    case 'CATALOG_TOKENS_BULK_ADD_BUTTON_ON_CLICK':
      catalogController.openBulkAddDialog(setState);
      break;
    case 'CATALOG_TOKENS_EXISTING_TOKEN_KEY_TEXT_ON_COMMIT':
      await catalogController.updateTokenKey(
        setState,
        setStoreState,
        getState,
        action.key,
        action.value,
        action.tokenType,
      );
      break;
    case 'CATALOG_TOKENS_TOKEN_REMOVE_BUTTON_ON_CLICK':
      await catalogController.removeToken(setState, setStoreState, getState, action.key, action.tokenType);
      break;
    case 'CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE':
      setCatalogNewTokenKey(setState, action.value);
      break;
    case 'CATALOG_TOKENS_NEW_TOKEN_ADD_BUTTON_ON_CLICK':
      await catalogController.addNewToken(
        setState,
        setStoreState,
        getState,
        action.tokenType,
        action.key,
      );
      break;
    case 'CATALOG_BULK_ADD_TOKENS_DIALOG_ON_OPEN':
      catalogController.openBulkAddDialog(setState);
      break;
    case 'CATALOG_BULK_ADD_TOKENS_TEXT_ON_CHANGE':
      setCatalogBulkAddText(setState, action.value);
      break;
    case 'CATALOG_BULK_ADD_TOKENS_CANCEL_BUTTON_ON_CLICK':
      catalogController.closeBulkAddDialog(setState);
      break;
    case 'CATALOG_BULK_ADD_TOKENS_OK_BUTTON_ON_CLICK':
      await catalogController.bulkAddTokens(setState, setStoreState, getState);
      break;
  }
};
