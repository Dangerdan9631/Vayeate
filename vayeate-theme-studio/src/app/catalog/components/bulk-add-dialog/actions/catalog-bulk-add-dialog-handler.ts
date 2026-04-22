import { singleton } from "tsyringe";
import { BulkAddTokensController } from "../controllers/bulk-add-tokens-controller";
import { CloseBulkAddDialogController } from "../controllers/close-bulk-add-dialog-controller";
import { SetCatalogBulkAddTextController } from "../controllers/set-catalog-bulk-add-text-controller";
import { Logger, LoggerFactory } from "../../../../../domain/utils/logger";
import { CatalogBulkAddDialogActions, CatalogBulkAddDialogActionType } from "./catalog-bulk-add-dialog-action-type";

@singleton()
export class CatalogBulkAddDialogHandler {
  private readonly log: Logger;

  constructor(
    private readonly setCatalogBulkAddText: SetCatalogBulkAddTextController,
    private readonly closeBulkAddDialog: CloseBulkAddDialogController,
    private readonly bulkAddTokens: BulkAddTokensController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(CatalogBulkAddDialogHandler.name);
  }

  handle(action: CatalogBulkAddDialogActions): void {
    switch (action.type) {
      case CatalogBulkAddDialogActionType.TextOnChange:
        return this.setCatalogBulkAddText.run(action.value);
      case CatalogBulkAddDialogActionType.CancelButtonOnClick:
        return this.closeBulkAddDialog.run();
      case CatalogBulkAddDialogActionType.OkButtonOnClick:
        return this.bulkAddTokens.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (CatalogBulkAddDialogAction union not exhaustive)', { action: _exhaustive });
  }
}
