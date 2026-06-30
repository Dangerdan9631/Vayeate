import { singleton } from "tsyringe";
import { AddGroupAndClearInputController } from "../controllers/add-group-and-clear-input-controller";
import { RemoveGroupController } from "../controllers/remove-group-controller";
import { SetTemplateAddGroupNameController } from "../controllers/set-template-add-group-name-controller";
import { Logger, LoggerFactory } from "../../../../domain/utils/logger";
import { GroupsCardActions, GroupsCardActionType } from "./groups-card-action-type";

/**
 * Routes template groups card actions to their controllers.
 */
@singleton()
export class GroupsCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly addGroupAndClearInput: AddGroupAndClearInputController,
    private readonly removeGroup: RemoveGroupController,
    private readonly setTemplateAddGroupName: SetTemplateAddGroupNameController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(GroupsCardHandler.name);
  }

  /**
   * Dispatches a groups card action to its controller.
   * @param action Typed card action from the action queue.
   * @returns Resolves when the controller finishes.
   */
  async handle(action: GroupsCardActions): Promise<void> {
    switch (action.type) {
      case GroupsCardActionType.GroupAddTextOnChange:
        return this.setTemplateAddGroupName.run(action.value);
      case GroupsCardActionType.GroupAddButtonOnClick:
        return this.addGroupAndClearInput.run();
      case GroupsCardActionType.GroupRemoveButtonOnClick:
        return this.removeGroup.run(action.groupId);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (GroupsCardAction union not exhaustive)', { action: _exhaustive });
  }
}
