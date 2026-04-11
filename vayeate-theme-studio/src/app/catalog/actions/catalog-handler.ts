import { singleton } from 'tsyringe';
import { BulkAddTokensController } from '../../../domain/controllers/catalog-controller/bulk-add/bulk-add-tokens-controller';
import { CloseBulkAddDialogController } from '../../../domain/controllers/catalog-controller/bulk-add/close-bulk-add-dialog-controller';
import { OpenBulkAddDialogController } from '../../../domain/controllers/catalog-controller/bulk-add/open-bulk-add-dialog-controller';
import { SetCatalogBulkAddTextController } from '../../../domain/controllers/catalog-controller/bulk-add/set-catalog-bulk-add-text-controller';
import { CloseCatalogCreateDialogController } from '../../../domain/controllers/catalog-controller/create-dialog/close-catalog-create-dialog-controller';
import { OpenCatalogCreateDialogController } from '../../../domain/controllers/catalog-controller/create-dialog/open-catalog-create-dialog-controller';
import { SetCatalogCreateDialogNameController } from '../../../domain/controllers/catalog-controller/create-dialog/set-catalog-create-dialog-name-controller';
import { SetCatalogCreateDialogTypeController } from '../../../domain/controllers/catalog-controller/create-dialog/set-catalog-create-dialog-type-controller';
import { DeleteCurrentCatalogVersionController } from '../../../domain/controllers/catalog-controller/catalog-list/delete-current-catalog-version-controller';
import { LockCatalogController } from '../../../domain/controllers/catalog-controller/catalog-details/lock-catalog-controller';
import { RevertCatalogToVersionController } from '../../../domain/controllers/catalog-controller/catalog-details/revert-catalog-to-version-controller';
import { SyncCatalogController } from '../../../domain/controllers/catalog-controller/catalog-details/sync-catalog-controller';
import { LoadCatalogPageController } from '../../../domain/controllers/catalog-controller/page/load-catalog-page-controller';
import { SetSelectedCatalogController } from '../../../domain/controllers/catalog-controller/page/set-selected-catalog-controller';
import { AddNewSourceController } from '../../../domain/controllers/catalog-controller/sources/add-new-source-controller';
import { RemoveSourceController } from '../../../domain/controllers/catalog-controller/sources/remove-source-controller';
import { SetCatalogNewSourceTokenTypeController } from '../../../domain/controllers/catalog-controller/sources/set-catalog-new-source-token-type-controller';
import { SetCatalogNewSourceTypeController } from '../../../domain/controllers/catalog-controller/sources/set-catalog-new-source-type-controller';
import { SetCatalogNewSourceUrlController } from '../../../domain/controllers/catalog-controller/sources/set-catalog-new-source-url-controller';
import { UpdateSourceTokenTypeController } from '../../../domain/controllers/catalog-controller/sources/update-source-token-type-controller';
import { UpdateSourceTypeController } from '../../../domain/controllers/catalog-controller/sources/update-source-type-controller';
import { UpdateSourceUrlController } from '../../../domain/controllers/catalog-controller/sources/update-source-url-controller';
import { AddCatalogSemanticTokenSelectorController } from '../../../domain/controllers/catalog-controller/tokens/add-catalog-semantic-token-selector-controller';
import { AddNewTokenController } from '../../../domain/controllers/catalog-controller/tokens/add-new-token-controller';
import { RemoveSemanticTokenListItemController } from '../../../domain/controllers/catalog-controller/tokens/remove-semantic-token-list-item-controller';
import { RemoveTokenController } from '../../../domain/controllers/catalog-controller/tokens/remove-token-controller';
import { SetCatalogNewSemanticTokenSelectorTextController } from '../../../domain/controllers/catalog-controller/tokens/set-catalog-new-semantic-token-selector-text-controller';
import { SetCatalogNewTokenKeyController } from '../../../domain/controllers/catalog-controller/tokens/set-catalog-new-token-key-controller';
import { SetCatalogTokensSearchTextController } from '../../../domain/controllers/catalog-controller/tokens/set-catalog-tokens-search-text-controller';
import { UpdateSemanticTokenRegistryTextController } from '../../../domain/controllers/catalog-controller/tokens/update-semantic-token-registry-text-controller';
import { UpdateTokenKeyController } from '../../../domain/controllers/catalog-controller/tokens/update-token-key-controller';
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
        this.openCatalogCreateDialog.run();
        break;
      case CatalogActionType.CatalogCreateDialogNameTextOnChange:
        this.setCatalogCreateDialogName.run(action.value);
        break;
      case CatalogActionType.CatalogCreateDialogTypeListOnCommit:
        this.setCatalogCreateDialogType.run(action.value);
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
        this.setCatalogNewSourceUrl.run(action.value);
        break;
      case CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit:
        this.setCatalogNewSourceTokenType.run(action.value);
        break;
      case CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit:
        this.setCatalogNewSourceType.run(action.value);
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
        this.setCatalogTokensSearchText.run(action.value);
        break;
      case CatalogActionType.CatalogTokensBulkAddButtonOnClick:
        this.openBulkAddDialog.run();
        break;
      case CatalogActionType.CatalogBulkAddTokensTextOnChange:
        this.setCatalogBulkAddText.run(action.value);
        break;
      case CatalogActionType.CatalogBulkAddTokensCancelButtonOnClick:
        this.closeBulkAddDialog.run();
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
        this.setCatalogNewTokenKey.run(action.value);
        break;
      case CatalogActionType.CatalogTokensNewTokenAddButtonOnClick:
        await this.addNewToken.run(action.tokenType, action.key);
        break;
      case CatalogActionType.CatalogTokensNewSemanticTokenSelectorTextOnChange:
        this.setCatalogNewSemanticTokenSelectorText.run(action.value);
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
