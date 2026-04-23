import { singleton } from "tsyringe";
import { DeleteCurrentTemplateVersionController } from "../controllers/delete-current-template-version-controller";
import { LockTemplateController } from "../controllers/lock-template-controller";
import { Logger, LoggerFactory } from "../../../../../domain/utils/logger";
import { TemplateDetailsCardActions, TemplateDetailsCardActionType } from "./template-details-card-action-type";

@singleton()
export class TemplateDetailsCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly deleteCurrentTemplateVersion: DeleteCurrentTemplateVersionController,
    private readonly lockTemplate: LockTemplateController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(TemplateDetailsCardHandler.name);
  }

  async handle(action: TemplateDetailsCardActions): Promise<void> {
    switch (action.type) {
      case TemplateDetailsCardActionType.DeleteVersionButtonOnClick:
        return this.deleteCurrentTemplateVersion.run();
      case TemplateDetailsCardActionType.LockButtonOnClick:
        return this.lockTemplate.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (TemplateDetailsCardAction union not exhaustive)', { action: _exhaustive });
  }
}
