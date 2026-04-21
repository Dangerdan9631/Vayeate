import { delay, inject, singleton } from 'tsyringe';
import { BulkAddTokensController } from '../controllers/bulk-add-tokens-controller';
import { CloseBulkAddDialogController } from '../controllers/close-bulk-add-dialog-controller';
import { OpenBulkAddDialogController } from '../controllers/open-bulk-add-dialog-controller';
import { SetCatalogBulkAddTextController } from '../controllers/set-catalog-bulk-add-text-controller';
import { OpenCatalogCreateDialogController } from '../components/create-dialog/controllers/open-catalog-create-dialog-controller';
import { DeleteCurrentCatalogVersionController } from '../controllers/delete-current-catalog-version-controller';
import { LockCatalogController } from '../controllers/lock-catalog-controller';
import { RevertCatalogToVersionController } from '../controllers/revert-catalog-to-version-controller';
import { SyncCatalogController } from '../controllers/sync-catalog-controller';
import { LoadCatalogPageController } from '../../common/controllers/load-catalog-page-controller';
import { SetSelectedCatalogController } from '../../catalog/controllers/set-selected-catalog-controller';
import { AddNewSourceController } from '../controllers/add-new-source-controller';
import { RemoveSourceController } from '../controllers/remove-source-controller';
import { SetCatalogNewSourceTokenTypeController } from '../controllers/set-catalog-new-source-token-type-controller';
import { SetCatalogNewSourceTypeController } from '../controllers/set-catalog-new-source-type-controller';
import { SetCatalogNewSourceUrlController } from '../controllers/set-catalog-new-source-url-controller';
import { UpdateSourceTokenTypeController } from '../controllers/update-source-token-type-controller';
import { UpdateSourceTypeController } from '../controllers/update-source-type-controller';
import { UpdateSourceUrlController } from '../controllers/update-source-url-controller';
import { AddCatalogSemanticTokenSelectorController } from '../controllers/add-catalog-semantic-token-selector-controller';
import { AddNewTokenController } from '../controllers/add-new-token-controller';
import { RemoveSemanticTokenListItemController } from '../controllers/remove-semantic-token-list-item-controller';
import { RemoveTokenController } from '../controllers/remove-token-controller';
import { SetCatalogNewSemanticTokenSelectorTextController } from '../controllers/set-catalog-new-semantic-token-selector-text-controller';
import { SetCatalogNewTokenKeyController } from '../controllers/set-catalog-new-token-key-controller';
import { SetCatalogTokensSearchTextController } from '../controllers/set-catalog-tokens-search-text-controller';
import { UpdateSemanticTokenRegistryTextController } from '../controllers/update-semantic-token-registry-text-controller';
import { UpdateTokenKeyController } from '../controllers/update-token-key-controller';
import { CatalogActions, CatalogActionType } from './catalog-action-type';
import { CatalogCreateDialogHandler } from '../components/create-dialog/actions/catalog-create-dialog-handler';
import { isCatalogCreateDialogAction } from '../components/create-dialog/actions/catalog-create-dialog-action-guard';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

@singleton()
export class CatalogActionHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadCatalogPage: LoadCatalogPageController,
    private readonly setSelectedCatalog: SetSelectedCatalogController,
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialogController,
    private readonly updateSourceUrl: UpdateSourceUrlController,
    private readonly updateSourceTokenType: UpdateSourceTokenTypeController,
    private readonly updateSourceType: UpdateSourceTypeController,
    private readonly removeSource: RemoveSourceController,
    private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrlController,
    private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenTypeController,
    private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeController,
    private readonly addNewSource: AddNewSourceController,
    private readonly deleteCurrentCatalogVersion: DeleteCurrentCatalogVersionController,
    private readonly syncCatalog: SyncCatalogController,
    private readonly lockCatalog: LockCatalogController,
    private readonly revertCatalogToVersion: RevertCatalogToVersionController,
    private readonly setCatalogTokensSearchText: SetCatalogTokensSearchTextController,
    private readonly openBulkAddDialog: OpenBulkAddDialogController,
    private readonly setCatalogBulkAddText: SetCatalogBulkAddTextController,
    private readonly closeBulkAddDialog: CloseBulkAddDialogController,
    private readonly bulkAddTokens: BulkAddTokensController,
    private readonly updateTokenKey: UpdateTokenKeyController,
    private readonly removeToken: RemoveTokenController,
    private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyController,
    private readonly addNewToken: AddNewTokenController,
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextController,
    private readonly addCatalogSemanticTokenSelector: AddCatalogSemanticTokenSelectorController,
    private readonly updateSemanticTokenRegistryText: UpdateSemanticTokenRegistryTextController,
    private readonly removeSemanticTokenListItem: RemoveSemanticTokenListItemController,
    loggerFactory: LoggerFactory,
    @inject(delay(() => CatalogCreateDialogHandler)) private readonly catalogCreateDialogHandler: CatalogCreateDialogHandler,
  ) {
    this.log = loggerFactory.create('CatalogActionHandler');
  }

  async handle(action: CatalogActions): Promise<void> {
    if (isCatalogCreateDialogAction(action)) {
      return this.catalogCreateDialogHandler.handle(action);
    }

    switch (action.type) {
      case CatalogActionType.CatalogPageOnLoad:
        return this.loadCatalogPage.run();
      case CatalogActionType.CatalogCatalogsListOnCommit:
        return await this.setSelectedCatalog.run(action.name, action.version);
      case CatalogActionType.CatalogCatalogsCreateButtonOnClick:
        return this.openCatalogCreateDialog.run();
      case CatalogActionType.CatalogDetailsSourceUrlTextOnCommit:
        return this.updateSourceUrl.run(action.sourceIndex, action.value);
      case CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit:
        return this.updateSourceTokenType.run(action.sourceIndex, action.value);
      case CatalogActionType.CatalogDetailsSourceTypeListOnCommit:
        return this.updateSourceType.run(action.sourceIndex, action.value);
      case CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick:
        return this.removeSource.run(action.sourceIndex);
      case CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange:
        return this.setCatalogNewSourceUrl.run(action.value);
      case CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit:
        return this.setCatalogNewSourceTokenType.run(action.value);
      case CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit:
        return this.setCatalogNewSourceType.run(action.value);
      case CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick:
        return this.addNewSource.run();
      case CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick:
        return await this.deleteCurrentCatalogVersion.run();
      case CatalogActionType.CatalogDetailsSyncButtonOnClick:
        return await this.syncCatalog.run();
      case CatalogActionType.CatalogDetailsLockButtonOnClick:
        return this.lockCatalog.run();
      case CatalogActionType.CatalogDetailsRevertButtonOnClick:
        return await this.revertCatalogToVersion.run();
      case CatalogActionType.CatalogTokensSearchTextOnChange:
        return this.setCatalogTokensSearchText.run(action.value);
      case CatalogActionType.CatalogTokensBulkAddButtonOnClick:
        return this.openBulkAddDialog.run();
      case CatalogActionType.CatalogBulkAddTokensTextOnChange:
        return this.setCatalogBulkAddText.run(action.value);
      case CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick:
        return this.closeBulkAddDialog.run();
      case CatalogActionType.CatalogBulkAddTokensOkButtonOnClick:
        return this.bulkAddTokens.run();
      case CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit:
        return this.updateTokenKey.run(action.key, action.value, action.tokenType);
      case CatalogActionType.CatalogTokensTokenRemoveButtonOnClick:
        return this.removeToken.run(action.key, action.tokenType);
      case CatalogActionType.CatalogTokensNewTokenKeyTextOnChange:
        return this.setCatalogNewTokenKey.run(action.value);
      case CatalogActionType.CatalogTokensNewTokenAddButtonOnClick:
        return this.addNewToken.run(action.tokenType, action.key);
      case CatalogActionType.CatalogTokensNewSemanticTokenSelectorTextOnChange:
        return this.setCatalogNewSemanticTokenSelectorText.run(action.value);
      case CatalogActionType.CatalogTokensNewSemanticTokenSelectorAddButtonOnClick:
        return this.addCatalogSemanticTokenSelector.run();
      case CatalogActionType.CatalogTokensExistingSemanticTokenTextOnCommit:
        return this.updateSemanticTokenRegistryText.run(
          action.registryList,
          action.index,
          action.value,
        );
      case CatalogActionType.CatalogTokensExistingSemanticTokenRemoveButtonOnClick:
        return this.removeSemanticTokenListItem.run(action.registryList, action.index);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (CatalogAction union not exhaustive)', { action: _exhaustive });
  }
}
