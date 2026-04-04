import { injectable } from 'tsyringe';
import {
  AddNewSourceController,
  AddNewTokenController,
  BulkAddTokensController,
  CloseBulkAddDialogController,
  CloseCatalogCreateDialogController,
  DeleteCatalogVersionController,
  LockCatalogController,
  OpenBulkAddDialogController,
  OpenCatalogCreateDialogController,
  RemoveSourceController,
  RemoveTokenController,
  RevertCatalogToVersionController,
  SaveCatalogController,
  SetCatalogBulkAddTextController,
  SetCatalogCreateDialogNameController,
  SetCatalogCreateDialogTypeController,
  SetCatalogNewSourceTokenTypeController,
  SetCatalogNewSourceTypeController,
  SetCatalogNewSourceUrlController,
  SetCatalogNewTokenKeyController,
  SetCatalogTokensSearchTextController,
  SetSelectedCatalogController,
  SyncCatalogController,
  UpdateSourceTokenTypeController,
  UpdateSourceTypeController,
  UpdateSourceUrlController,
  UpdateTokenKeyController,
  LoadCatalogPageController,
} from '../../../domain/controllers/catalog-controller';
import type { ActionHandler, CatalogAction } from '../../common/actions/handler-types';
import { CatalogActionType } from './catalog-action-type';

@injectable()
export class CatalogActionHandler implements ActionHandler<CatalogAction> {
  constructor(
    private readonly addNewSource: AddNewSourceController,
    private readonly addNewToken: AddNewTokenController,
    private readonly bulkAddTokens: BulkAddTokensController,
    private readonly closeBulkAddDialog: CloseBulkAddDialogController,
    private readonly closeCatalogCreateDialog: CloseCatalogCreateDialogController,
    private readonly deleteCatalogVersion: DeleteCatalogVersionController,
    private readonly lockCatalog: LockCatalogController,
    private readonly openBulkAddDialog: OpenBulkAddDialogController,
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialogController,
    private readonly removeSource: RemoveSourceController,
    private readonly removeToken: RemoveTokenController,
    private readonly revertCatalogToVersion: RevertCatalogToVersionController,
    private readonly saveCatalog: SaveCatalogController,
    private readonly setCatalogBulkAddText: SetCatalogBulkAddTextController,
    private readonly setCatalogCreateDialogName: SetCatalogCreateDialogNameController,
    private readonly setCatalogCreateDialogType: SetCatalogCreateDialogTypeController,
    private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenTypeController,
    private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeController,
    private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrlController,
    private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyController,
    private readonly setCatalogTokensSearchText: SetCatalogTokensSearchTextController,
    private readonly setSelectedCatalog: SetSelectedCatalogController,
    private readonly syncCatalog: SyncCatalogController,
    private readonly updateSourceTokenType: UpdateSourceTokenTypeController,
    private readonly updateSourceType: UpdateSourceTypeController,
    private readonly updateSourceUrl: UpdateSourceUrlController,
    private readonly updateTokenKey: UpdateTokenKeyController,
    private readonly loadCatalogPage: LoadCatalogPageController,
  ) {}

  async handle(action: CatalogAction): Promise<void> {
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
      case CatalogActionType.CatalogCreateDialogOnOpen:
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
      case CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick:
        await this.deleteCatalogVersion.run(action.name, action.version);
        break;
      case CatalogActionType.CatalogDetailsSyncButtonOnClick:
        await this.syncCatalog.run(action.catalog);
        break;
      case CatalogActionType.CatalogDetailsLockButtonOnClick:
        await this.lockCatalog.run();
        break;
      case CatalogActionType.CatalogDetailsRevertButtonOnClick:
        await this.revertCatalogToVersion.run(action.name, action.version);
        break;
      case CatalogActionType.CatalogDetailsSaveCatalog:
        await this.saveCatalog.run(action.catalog);
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
      case CatalogActionType.CatalogTokensSearchTextOnChange:
        this.setCatalogTokensSearchText.run(action.value);
        break;
      case CatalogActionType.CatalogTokensBulkAddButtonOnClick:
        this.openBulkAddDialog.run();
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
      case CatalogActionType.CatalogBulkAddTokensDialogOnOpen:
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
    }
  }
}
