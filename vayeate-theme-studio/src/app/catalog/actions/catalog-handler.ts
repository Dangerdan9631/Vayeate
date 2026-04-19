import { singleton } from 'tsyringe';
import { BulkAddTokensController } from '../controllers/bulk-add-tokens-controller';
import { CloseBulkAddDialogController } from '../controllers/close-bulk-add-dialog-controller';
import { OpenBulkAddDialogController } from '../controllers/open-bulk-add-dialog-controller';
import { SetCatalogBulkAddTextController } from '../controllers/set-catalog-bulk-add-text-controller';
import { CloseCatalogCreateDialogController } from '../controllers/close-catalog-create-dialog-controller';
import { OpenCatalogCreateDialogController } from '../controllers/open-catalog-create-dialog-controller';
import { SetCatalogCreateDialogNameController } from '../controllers/set-catalog-create-dialog-name-controller';
import { SetCatalogCreateDialogTypeController } from '../controllers/set-catalog-create-dialog-type-controller';
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

@singleton()
export class CatalogActionHandler {
  constructor(
    private readonly loadCatalogPage: LoadCatalogPageController,
    private readonly setSelectedCatalog: SetSelectedCatalogController,
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialogController,
    private readonly setCatalogCreateDialogName: SetCatalogCreateDialogNameController,
    private readonly setCatalogCreateDialogType: SetCatalogCreateDialogTypeController,
    private readonly closeCatalogCreateDialog: CloseCatalogCreateDialogController,
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
  ) {}

  async handle(action: CatalogActions): Promise<void> {
    switch (action.type) {
      case CatalogActionType.CatalogPageOnLoad:
        await this.loadCatalogPage.run();
        break;
      case CatalogActionType.CatalogCatalogsListOnCommit:
        await this.setSelectedCatalog.run(action.name, action.version);
        break;
      case CatalogActionType.CatalogCatalogsCreateButtonOnClick:
        await this.openCatalogCreateDialog.run();
        break;
      case CatalogActionType.CatalogCreateDialogNameTextOnChange:
        await this.setCatalogCreateDialogName.run(action.value);
        break;
      case CatalogActionType.CatalogCreateDialogTypeListOnCommit:
        await this.setCatalogCreateDialogType.run(action.value);
        break;
      case CatalogActionType.CatalogCreateDialogCancelButtonOnClick:
        await this.closeCatalogCreateDialog.run('Cancel');
        break;
      case CatalogActionType.CatalogCreateDialogOkButtonOnClick:
        await this.closeCatalogCreateDialog.run('OK');
        break;
      case CatalogActionType.CatalogDetailsSourceUrlTextOnCommit:
        await this.updateSourceUrl.run(action.sourceIndex, action.value);
        break;
      case CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit:
        await this.updateSourceTokenType.run(action.sourceIndex, action.value);
        break;
      case CatalogActionType.CatalogDetailsSourceTypeListOnCommit:
        await this.updateSourceType.run(action.sourceIndex, action.value);
        break;
      case CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick:
        await this.removeSource.run(action.sourceIndex);
        break;
      case CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange:
        await this.setCatalogNewSourceUrl.run(action.value);
        break;
      case CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit:
        await this.setCatalogNewSourceTokenType.run(action.value);
        break;
      case CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit:
        await this.setCatalogNewSourceType.run(action.value);
        break;
      case CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick:
        await this.addNewSource.run();
        break;
      case CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick:
        await this.deleteCurrentCatalogVersion.run();
        break;
      case CatalogActionType.CatalogDetailsSyncButtonOnClick:
        await this.syncCatalog.run();
        break;
      case CatalogActionType.CatalogDetailsLockButtonOnClick:
        await this.lockCatalog.run();
        break;
      case CatalogActionType.CatalogDetailsRevertButtonOnClick:
        await this.revertCatalogToVersion.run();
        break;
      case CatalogActionType.CatalogTokensSearchTextOnChange:
        await this.setCatalogTokensSearchText.run(action.value);
        break;
      case CatalogActionType.CatalogTokensBulkAddButtonOnClick:
        await this.openBulkAddDialog.run();
        break;
      case CatalogActionType.CatalogBulkAddTokensTextOnChange:
        await this.setCatalogBulkAddText.run(action.value);
        break;
      case CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick:
        await this.closeBulkAddDialog.run();
        break;
      case CatalogActionType.CatalogBulkAddTokensOkButtonOnClick:
        await this.bulkAddTokens.run();
        break;
      case CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit:
        await this.updateTokenKey.run(action.key, action.value, action.tokenType);
        break;
      case CatalogActionType.CatalogTokensTokenRemoveButtonOnClick:
        await this.removeToken.run(action.key, action.tokenType);
        break;
      case CatalogActionType.CatalogTokensNewTokenKeyTextOnChange:
        await this.setCatalogNewTokenKey.run(action.value);
        break;
      case CatalogActionType.CatalogTokensNewTokenAddButtonOnClick:
        await this.addNewToken.run(action.tokenType, action.key);
        break;
      case CatalogActionType.CatalogTokensNewSemanticTokenSelectorTextOnChange:
        await this.setCatalogNewSemanticTokenSelectorText.run(action.value);
        break;
      case CatalogActionType.CatalogTokensNewSemanticTokenSelectorAddButtonOnClick:
        await this.addCatalogSemanticTokenSelector.run();
        break;
      case CatalogActionType.CatalogTokensExistingSemanticTokenTextOnCommit:
        await this.updateSemanticTokenRegistryText.run(
          action.registryList,
          action.index,
          action.value,
        );
        break;
      case CatalogActionType.CatalogTokensExistingSemanticTokenRemoveButtonOnClick:
        await this.removeSemanticTokenListItem.run(action.registryList, action.index);
        break;
    }
  }
}
