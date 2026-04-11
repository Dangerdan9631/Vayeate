import { singleton } from 'tsyringe';
import {
  AddCatalogSemanticTokenSelectorController,
  AddNewSourceController,
  AddNewTokenController,
  BulkAddTokensController,
  CloseBulkAddDialogController,
  CloseCatalogCreateDialogController,
  DeleteCurrentCatalogVersionController,
  LoadCatalogPageController,
  LockCatalogController,
  OpenBulkAddDialogController,
  OpenCatalogCreateDialogController,
  RemoveSemanticTokenListItemController,
  RemoveSourceController,
  RemoveTokenController,
  RevertCatalogToVersionController,
  SetCatalogBulkAddTextController,
  SetCatalogCreateDialogNameController,
  SetCatalogCreateDialogTypeController,
  SetCatalogNewSemanticTokenSelectorTextController,
  SetCatalogNewSourceTokenTypeController,
  SetCatalogNewSourceTypeController,
  SetCatalogNewSourceUrlController,
  SetCatalogNewTokenKeyController,
  SetCatalogTokensSearchTextController,
  SetSelectedCatalogController,
  SyncCatalogController,
  UpdateSemanticTokenRegistryTextController,
  UpdateSourceTokenTypeController,
  UpdateSourceTypeController,
  UpdateSourceUrlController,
  UpdateTokenKeyController,
} from '../../../domain/controllers/catalog-controller';
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
