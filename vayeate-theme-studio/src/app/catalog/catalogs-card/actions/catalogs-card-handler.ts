import { singleton } from "tsyringe";
import { SetSelectedCatalogController } from "../controllers/set-selected-catalog-controller";
import { OpenCatalogCreateDialogController } from "../../create-dialog/controllers/open-catalog-create-dialog-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { CatalogsCardActions, CatalogsCardActionType } from "./catalogs-card-action-type";

/**
 * Routes catalogs picker actions to selection and create-dialog controllers.
 */
@singleton()
export class CatalogsCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly setSelectedCatalog: SetSelectedCatalogController,
    private readonly openCatalogCreateDialog: OpenCatalogCreateDialogController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(CatalogsCardHandler.name);
  }

  /**
   * Dispatches a catalogs card action to the matching controller.
   * @param action - Catalogs card action from the queue.
   * @returns Promise that settles when handling completes.
   */
  async handle(action: CatalogsCardActions): Promise<void> {
    switch (action.type) {
      case CatalogsCardActionType.CatalogsListOnCommit:
      case CatalogsCardActionType.CatalogVersionsListOnCommit:
        return this.setSelectedCatalog.run(action.name, action.version);
      case CatalogsCardActionType.CatalogsCreateButtonOnClick:
        return this.openCatalogCreateDialog.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (CatalogsCardAction union not exhaustive)', { action: _exhaustive });
  }
}
