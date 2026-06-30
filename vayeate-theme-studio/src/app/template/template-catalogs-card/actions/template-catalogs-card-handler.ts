import { singleton } from "tsyringe";
import { ChangeCatalogVersionController } from "../controllers/change-catalog-version-controller";
import { ToggleCatalogController } from "../controllers/toggle-catalog-controller";
import { UpdateAllCatalogsController } from "../controllers/update-all-catalogs-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { TemplateCatalogsCardActions, TemplateCatalogsCardActionType } from "./template-catalogs-card-action-type";

/**
 * Routes template catalogs card actions to their controllers.
 */
@singleton()
export class TemplateCatalogsCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly changeCatalogVersion: ChangeCatalogVersionController,
    private readonly toggleCatalog: ToggleCatalogController,
    private readonly updateAllCatalogs: UpdateAllCatalogsController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(TemplateCatalogsCardHandler.name);
  }

  /**
   * Dispatches a template catalogs card action to its controller.
   * @param action Typed card action from the action queue.
   * @returns Resolves when the controller finishes.
   */
  async handle(action: TemplateCatalogsCardActions): Promise<void> {
    switch (action.type) {
      case TemplateCatalogsCardActionType.UpdateAllButtonOnClick:
        return this.updateAllCatalogs.run();
      case TemplateCatalogsCardActionType.CatalogCheckboxOnToggle:
        return this.toggleCatalog.run(action.catalogName);
      case TemplateCatalogsCardActionType.CatalogVersionListOnCommit:
        return this.changeCatalogVersion.run(action.catalogName, action.value);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (TemplateCatalogsCardAction union not exhaustive)', { action: _exhaustive });
  }
}
