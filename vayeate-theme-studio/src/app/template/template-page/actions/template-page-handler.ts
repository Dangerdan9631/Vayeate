import { singleton } from "tsyringe";
import { LoadTemplatePageController } from "../controllers/load-template-page-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { TemplatePageActions, TemplatePageActionType } from "./template-page-action-type";

/**
 * Routes Templates page actions to their controllers.
 */
@singleton()
export class TemplatePageHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadTemplatePage: LoadTemplatePageController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(TemplatePageHandler.name);
  }

  /**
   * Dispatches a Templates page action to its controller.
   * @param action Typed page action from the action queue.
   * @returns Resolves when the controller finishes.
   */
  async handle(action: TemplatePageActions): Promise<void> {
    switch (action.type) {
      case TemplatePageActionType.PageOnLoad:
        return this.loadTemplatePage.run();
    }

    this.log.error('Unhandled action (TemplatePageAction union not exhaustive)', { action });
  }
}
