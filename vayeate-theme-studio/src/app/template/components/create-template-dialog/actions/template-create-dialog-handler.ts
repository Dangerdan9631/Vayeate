import { singleton } from "tsyringe";
import { CloseCreateDialogController } from "../../../controllers/close-create-dialog-controller";
import { CreateTemplateController } from "../../../controllers/create-template-controller";
import { SetCreateFormNameController } from "../../../controllers/set-create-form-name-controller";
import { Logger, LoggerFactory } from "../../../../../domain/utils/logger";
import { TemplateCreateDialogActions, TemplateCreateDialogActionType } from "./template-create-dialog-action-type";

@singleton()
export class TemplateCreateDialogHandler {
  private readonly log: Logger;

  constructor(
    private readonly closeCreateDialog: CloseCreateDialogController,
    private readonly createTemplate: CreateTemplateController,
    private readonly setCreateFormName: SetCreateFormNameController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(TemplateCreateDialogHandler.name);
  }

  async handle(action: TemplateCreateDialogActions): Promise<void> {
    switch (action.type) {
      case TemplateCreateDialogActionType.NameTextOnChange:
        return this.setCreateFormName.run(action.value);
      case TemplateCreateDialogActionType.CancelButtonOnClick:
        return this.closeCreateDialog.run();
      case TemplateCreateDialogActionType.OkButtonOnClick:
        return this.createTemplate.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (TemplateCreateDialogAction union not exhaustive)', { action: _exhaustive });
  }
}
