import { singleton } from "tsyringe";

import { Logger, LoggerFactory } from "../../../../../domain/utils/logger";
import { CatalogPageActions, CatalogPageActionType } from "./catalog-page-action-type";
import { LoadCatalogPageController } from "../controllers/load-catalog-page-controller";

@singleton()
export class CatalogPageHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadCatalogPage: LoadCatalogPageController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(CatalogPageHandler.name);
  }

  handle(action: CatalogPageActions): void {
    switch (action.type) {
      case CatalogPageActionType.PageOnLoad:
        return this.loadCatalogPage.run();
    }

    this.log.error('Unhandled action (CatalogPageAction union not exhaustive)', { action });
  }
}
