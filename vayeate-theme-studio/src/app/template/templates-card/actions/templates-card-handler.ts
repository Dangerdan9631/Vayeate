import { singleton } from "tsyringe";
import { OpenCreateDialogController } from "../controllers/open-create-dialog-controller";
import { SelectTemplateAndLoadController } from "../controllers/select-template-and-load-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { TemplatesCardActions, TemplatesCardActionType } from "./templates-card-action-type";

/**
 * Routes Templates list card actions to their controllers.
 */
@singleton()
export class TemplatesCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly openCreateDialog: OpenCreateDialogController,
    private readonly selectTemplateAndLoad: SelectTemplateAndLoadController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(TemplatesCardHandler.name);
  }

  /**
   * Dispatches a Templates list card action to its controller.
   * @param action Typed card action from the action queue.
   * @returns Resolves when the controller finishes.
   */
  async handle(action: TemplatesCardActions): Promise<void> {
    switch (action.type) {
      case TemplatesCardActionType.TemplatesListOnCommit:
        return this.selectTemplateAndLoad.run(action.name, action.version);
      case TemplatesCardActionType.TemplatesCreateButtonOnClick:
        return this.openCreateDialog.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (TemplatesCardAction union not exhaustive)', { action: _exhaustive });
  }
}
