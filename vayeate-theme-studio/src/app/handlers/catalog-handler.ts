import * as catalogController from '../../domain/controllers/catalog-controller';
import type { ActionHandler, CatalogAction, HandlerDeps } from './handler-types';
import { CatalogActionType } from '../actions/action-types';
import { container } from 'tsyringe';

export const handleCatalogAction: ActionHandler<CatalogAction> = async (
  action: CatalogAction,
  _deps: HandlerDeps,
): Promise<void> => {
  switch (action.type) {
    case CatalogActionType.CatalogPageOnLoad:
      await container.resolve(catalogController.LoadCatalogPageController).run();
      break;
    case CatalogActionType.CatalogCatalogsListOnCommit:
      await container.resolve(catalogController.SetSelectedCatalogController).run(action.name, action.version);
      break;
    case CatalogActionType.CatalogCatalogsCreateButtonOnClick:
      container.resolve(catalogController.OpenCatalogCreateDialogController).run();
      break;
    case CatalogActionType.CatalogCreateDialogOnOpen:
      container.resolve(catalogController.OpenCatalogCreateDialogController).run();
      break;
    case CatalogActionType.CatalogCreateDialogNameTextOnChange:
      container.resolve(catalogController.SetCatalogCreateDialogNameController).run(action.value);
      break;
    case CatalogActionType.CatalogCreateDialogTypeListOnCommit:
      container.resolve(catalogController.SetCatalogCreateDialogTypeController).run(action.value);
      break;
    case CatalogActionType.CatalogCreateDialogCancelButtonOnClick:
      await container.resolve(catalogController.CloseCatalogCreateDialogController).run('Cancel');
      break;
    case CatalogActionType.CatalogCreateDialogOkButtonOnClick:
      await container.resolve(catalogController.CloseCatalogCreateDialogController).run('OK');
      break;
    case CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick:
      await container.resolve(catalogController.DeleteCatalogVersionController).run(action.name, action.version);
      break;
    case CatalogActionType.CatalogDetailsSyncButtonOnClick:
      await container.resolve(catalogController.SyncCatalogController).run(action.catalog);
      break;
    case CatalogActionType.CatalogDetailsLockButtonOnClick:
      await container.resolve(catalogController.LockCatalogController).run();
      break;
    case CatalogActionType.CatalogDetailsRevertButtonOnClick:
      await container.resolve(catalogController.RevertCatalogToVersionController).run(action.name, action.version);
      break;
    case CatalogActionType.CatalogDetailsSaveCatalog:
      await container.resolve(catalogController.SaveCatalogController).run(action.catalog);
      break;
    case CatalogActionType.CatalogDetailsSourceUrlTextOnCommit:
      await container.resolve(catalogController.UpdateSourceUrlController).run(action.sourceIndex, action.value);
      break;
    case CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit:
      await container
        .resolve(catalogController.UpdateSourceTokenTypeController)
        .run(action.sourceIndex, action.value);
      break;
    case CatalogActionType.CatalogDetailsSourceTypeListOnCommit:
      await container.resolve(catalogController.UpdateSourceTypeController).run(action.sourceIndex, action.value);
      break;
    case CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick:
      await container.resolve(catalogController.RemoveSourceController).run(action.sourceIndex);
      break;
    case CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange:
      container.resolve(catalogController.SetCatalogNewSourceUrlController).run(action.value);
      break;
    case CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit:
      container.resolve(catalogController.SetCatalogNewSourceTokenTypeController).run(action.value);
      break;
    case CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit:
      container.resolve(catalogController.SetCatalogNewSourceTypeController).run(action.value);
      break;
    case CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick:
      await container.resolve(catalogController.AddNewSourceController).run();
      break;
    case CatalogActionType.CatalogTokensSearchTextOnChange:
      container.resolve(catalogController.SetCatalogTokensSearchTextController).run(action.value);
      break;
    case CatalogActionType.CatalogTokensBulkAddButtonOnClick:
      container.resolve(catalogController.OpenBulkAddDialogController).run();
      break;
    case CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit:
      await container
        .resolve(catalogController.UpdateTokenKeyController)
        .run(action.key, action.value, action.tokenType);
      break;
    case CatalogActionType.CatalogTokensTokenRemoveButtonOnClick:
      await container.resolve(catalogController.RemoveTokenController).run(action.key, action.tokenType);
      break;
    case CatalogActionType.CatalogTokensNewTokenKeyTextOnChange:
      container.resolve(catalogController.SetCatalogNewTokenKeyController).run(action.value);
      break;
    case CatalogActionType.CatalogTokensNewTokenAddButtonOnClick:
      await container.resolve(catalogController.AddNewTokenController).run(action.tokenType, action.key);
      break;
    case CatalogActionType.CatalogBulkAddTokensDialogOnOpen:
      container.resolve(catalogController.OpenBulkAddDialogController).run();
      break;
    case CatalogActionType.CatalogBulkAddTokensTextOnChange:
      container.resolve(catalogController.SetCatalogBulkAddTextController).run(action.value);
      break;
    case CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick:
      container.resolve(catalogController.CloseBulkAddDialogController).run();
      break;
    case CatalogActionType.CatalogBulkAddTokensOkButtonOnClick:
      await container.resolve(catalogController.BulkAddTokensController).run();
      break;
  }
};
