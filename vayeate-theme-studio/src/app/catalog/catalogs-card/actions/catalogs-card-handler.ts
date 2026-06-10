import { singleton } from "tsyringe";
import { SetSelectedCatalogController } from "../controllers/set-selected-catalog-controller";
import { OpenCatalogCreateDialogController } from "../../create-dialog/controllers/open-catalog-create-dialog-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { CatalogsCardActions, CatalogsCardActionType } from "./catalogs-card-action-type";

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
