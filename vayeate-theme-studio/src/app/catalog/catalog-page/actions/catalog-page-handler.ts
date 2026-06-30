import { singleton } from "tsyringe";

import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { CatalogPageActions, CatalogPageActionType } from "./catalog-page-action-type";
import { LoadCatalogPageController } from "../controllers/load-catalog-page-controller";

/**
 * Routes catalog page lifecycle actions to page controllers.
 */
@singleton()
export class CatalogPageHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadCatalogPage: LoadCatalogPageController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(CatalogPageHandler.name);
  }

  /**
   * Dispatches a catalog page action to the matching controller.
   * @param action - Catalog page action from the queue.
   */
  handle(action: CatalogPageActions): void {
    switch (action.type) {
      case CatalogPageActionType.PageOnLoad:
        return this.loadCatalogPage.run();
    }

    this.log.error('Unhandled action (CatalogPageAction union not exhaustive)', { action });
  }
}
