import { singleton } from "tsyringe";
import { LoadTemplatePageController } from "../../../../common/controllers/load-template-page-controller";
import { Logger, LoggerFactory } from "../../../../../domain/utils/logger";
import { TemplatePageActions, TemplatePageActionType } from "./template-page-action-type";

@singleton()
export class TemplatePageHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadTemplatePage: LoadTemplatePageController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(TemplatePageHandler.name);
  }

  async handle(action: TemplatePageActions): Promise<void> {
    switch (action.type) {
      case TemplatePageActionType.PageOnLoad:
        return this.loadTemplatePage.run();
    }

    this.log.error('Unhandled action (TemplatePageAction union not exhaustive)', { action });
  }
}
