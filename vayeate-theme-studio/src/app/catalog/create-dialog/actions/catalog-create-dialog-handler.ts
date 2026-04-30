import { SetCatalogCreateDialogNameController } from "../controllers/set-catalog-create-dialog-name-controller";
import { SetCatalogCreateDialogTypeController } from "../controllers/set-catalog-create-dialog-type-controller";
import { CatalogCreateDialogActions, CatalogCreateDialogActionType } from "./catalog-create-dialog-action-type";
import { CloseCatalogCreateDialogController } from "../controllers/close-catalog-create-dialog-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { singleton } from "tsyringe";

@singleton()
export class CatalogCreateDialogHandler {
  private readonly log: Logger;

  constructor(
    private readonly setCatalogCreateDialogName: SetCatalogCreateDialogNameController,
    private readonly setCatalogCreateDialogType: SetCatalogCreateDialogTypeController,
    private readonly closeCatalogCreateDialog: CloseCatalogCreateDialogController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(CatalogCreateDialogHandler.name);
  }

  handle(action: CatalogCreateDialogActions): void {
    switch (action.type) {
      case CatalogCreateDialogActionType.NameTextOnChange:
        return this.setCatalogCreateDialogName.run(action.value);
      case CatalogCreateDialogActionType.TypeListOnCommit:
        return this.setCatalogCreateDialogType.run(action.value);
      case CatalogCreateDialogActionType.CancelButtonOnClick:
        return this.closeCatalogCreateDialog.run('Cancel');
      case CatalogCreateDialogActionType.OkButtonOnClick:
        return this.closeCatalogCreateDialog.run('OK');
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (CatalogCreateDialogAction union not exhaustive)', { action: _exhaustive });
  }
}
