import { singleton } from "tsyringe";
import { AddNewSourceController } from "../controllers/add-new-source-controller";
import { DeleteCurrentCatalogVersionController } from "../controllers/delete-current-catalog-version-controller";
import { LockCatalogController } from "../controllers/lock-catalog-controller";
import { RemoveSourceController } from "../controllers/remove-source-controller";
import { RevertCatalogToVersionController } from "../controllers/revert-catalog-to-version-controller";
import { SetCatalogNewSourceTokenTypeController } from "../controllers/set-catalog-new-source-token-type-controller";
import { SetCatalogNewSourceTypeController } from "../controllers/set-catalog-new-source-type-controller";
import { SetCatalogNewSourceUrlController } from "../controllers/set-catalog-new-source-url-controller";
import { SyncCatalogController } from "../controllers/sync-catalog-controller";
import { UpdateSourceTokenTypeController } from "../controllers/update-source-token-type-controller";
import { UpdateSourceTypeController } from "../controllers/update-source-type-controller";
import { UpdateSourceUrlController } from "../controllers/update-source-url-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { CatalogDetailsCardActions, CatalogDetailsCardActionType } from "./catalog-details-card-action-type";

/**
 * Routes catalog details card actions to source and lifecycle controllers.
 */
@singleton()
export class CatalogDetailsCardHandler {
  private readonly log: Logger;

  constructor(
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
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(CatalogDetailsCardHandler.name);
  }

  /**
   * Dispatches a catalog details card action to the matching controller.
   * @param action - Catalog details card action from the queue.
   * @returns Promise that settles when handling completes.
   */
  async handle(action: CatalogDetailsCardActions): Promise<void> {
    switch (action.type) {
      case CatalogDetailsCardActionType.SourceUrlTextOnCommit:
        return this.updateSourceUrl.run(action.sourceIndex, action.value);
      case CatalogDetailsCardActionType.SourceTokenTypeListOnCommit:
        return this.updateSourceTokenType.run(action.sourceIndex, action.value);
      case CatalogDetailsCardActionType.SourceTypeListOnCommit:
        return this.updateSourceType.run(action.sourceIndex, action.value);
      case CatalogDetailsCardActionType.SourceRemoveButtonOnClick:
        return this.removeSource.run(action.sourceIndex);
      case CatalogDetailsCardActionType.NewSourceUrlTextOnChange:
        return this.setCatalogNewSourceUrl.run(action.value);
      case CatalogDetailsCardActionType.NewSourceTokenTypeListOnCommit:
        return this.setCatalogNewSourceTokenType.run(action.value);
      case CatalogDetailsCardActionType.NewSourceTypeListOnCommit:
        return this.setCatalogNewSourceType.run(action.value);
      case CatalogDetailsCardActionType.NewSourceAddButtonOnClick:
        return this.addNewSource.run();
      case CatalogDetailsCardActionType.DeleteVersionButtonOnClick:
        return await this.deleteCurrentCatalogVersion.run();
      case CatalogDetailsCardActionType.SyncButtonOnClick:
        return await this.syncCatalog.run();
      case CatalogDetailsCardActionType.LockButtonOnClick:
        return this.lockCatalog.run();
      case CatalogDetailsCardActionType.RevertButtonOnClick:
        return await this.revertCatalogToVersion.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (CatalogDetailsCardAction union not exhaustive)', { action: _exhaustive });
  }
}
