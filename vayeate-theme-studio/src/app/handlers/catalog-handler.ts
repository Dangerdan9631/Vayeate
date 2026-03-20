import * as catalogController from '../../domain/controllers/catalog-controller';
import type { ActionHandler, CatalogAction, HandlerDeps } from './handler-types';
import { CatalogActionType } from '../actions/action-types';
import { container } from 'tsyringe';

export const handleCatalogAction: ActionHandler<CatalogAction> = async (
  action: CatalogAction,
  { setState, getState, setStoreState }: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case CatalogActionType.CatalogPageOnLoad:
      await container.resolve(catalogController.LoadCatalogPageController).run();
      break;
    case CatalogActionType.CatalogCatalogsListOnCommit:
      await catalogController.selectCatalogAndLoad(setState, action.name, action.version);
      break;
    case CatalogActionType.CatalogCatalogsCreateButtonOnClick:
      catalogController.openCatalogCreateDialog(setState);
      break;
    case CatalogActionType.CatalogCreateDialogOnOpen:
      catalogController.openCatalogCreateDialog(setState);
      break;
    case CatalogActionType.CatalogCreateDialogNameTextOnChange:
      catalogController.setCatalogCreateFormName(setState, action.value);
      break;
    case CatalogActionType.CatalogCreateDialogTypeListOnCommit:
      catalogController.setCatalogCreateFormType(setState, action.value);
      break;
    case CatalogActionType.CatalogCreateDialogCancelButtonOnClick:
      catalogController.closeCatalogCreateDialog(setState);
      break;
    case CatalogActionType.CatalogCreateDialogOkButtonOnClick:
      await catalogController.createCatalog(setState, setStoreState, action.params);
      break;
    case CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick:
      await catalogController.deleteCatalogVersion(setState, setStoreState, action.name, action.version);
      break;
    case CatalogActionType.CatalogDetailsSyncButtonOnClick:
      await catalogController.syncCatalog(setState, setStoreState, action.catalog);
      break;
    case CatalogActionType.CatalogDetailsLockButtonOnClick:
      await catalogController.lockCatalog(setState, setStoreState, getState);
      break;
    case CatalogActionType.CatalogDetailsRevertButtonOnClick:
      await catalogController.revertCatalogToVersion(setState, setStoreState, action.name, action.version);
      break;
    case CatalogActionType.CatalogDetailsSaveCatalog:
      await catalogController.saveCatalog(setState, setStoreState, action.catalog);
      break;
    case CatalogActionType.CatalogDetailsSourceUrlTextOnCommit:
      await catalogController.updateSourceUrl(setState, setStoreState, getState, action.sourceIndex, action.value);
      break;
    case CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit:
      await catalogController.updateSourceTokenType(setState, setStoreState, getState, action.sourceIndex, action.value);
      break;
    case CatalogActionType.CatalogDetailsSourceTypeListOnCommit:
      await catalogController.updateSourceType(setState, setStoreState, getState, action.sourceIndex, action.value);
      break;
    case CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick:
      await catalogController.removeSource(setState, setStoreState, getState, action.sourceIndex);
      break;
    case CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange:
      catalogController.setCatalogNewSourceUrl(setState, action.value);
      break;
    case CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit:
      catalogController.setCatalogNewSourceTokenType(setState, action.value);
      break;
    case CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit:
      catalogController.setCatalogNewSourceType(setState, action.value);
      break;
    case CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick:
      await catalogController.addNewSource(setState, setStoreState, getState);
      break;
    case CatalogActionType.CatalogTokensSearchTextOnChange:
      catalogController.setCatalogTokensSearchText(setState, action.value);
      break;
    case CatalogActionType.CatalogTokensBulkAddButtonOnClick:
      catalogController.openBulkAddDialog(setState);
      break;
    case CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit:
      await catalogController.updateTokenKey(
        setState,
        setStoreState,
        getState,
        action.key,
        action.value,
        action.tokenType,
      );
      break;
    case CatalogActionType.CatalogTokensTokenRemoveButtonOnClick:
      await catalogController.removeToken(setState, setStoreState, getState, action.key, action.tokenType);
      break;
    case CatalogActionType.CatalogTokensNewTokenKeyTextOnChange:
      catalogController.setCatalogNewTokenKey(setState, action.value);
      break;
    case CatalogActionType.CatalogTokensNewTokenAddButtonOnClick:
      await catalogController.addNewToken(
        setState,
        setStoreState,
        getState,
        action.tokenType,
        action.key,
      );
      break;
    case CatalogActionType.CatalogBulkAddTokensDialogOnOpen:
      catalogController.openBulkAddDialog(setState);
      break;
    case CatalogActionType.CatalogBulkAddTokensTextOnChange:
      catalogController.setCatalogBulkAddText(setState, action.value);
      break;
    case CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick:
      catalogController.closeBulkAddDialog(setState);
      break;
    case CatalogActionType.CatalogBulkAddTokensOkButtonOnClick:
      await catalogController.bulkAddTokens(setState, setStoreState, getState);
      break;
  }
};
