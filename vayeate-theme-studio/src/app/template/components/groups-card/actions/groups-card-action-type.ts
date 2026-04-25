import { AppAction } from "../../../../core/action-queue/app-action";

export enum GroupsCardActionType {
  GroupAddTextOnChange = 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE',
  GroupAddButtonOnClick = 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK',
  GroupRemoveButtonOnClick = 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK',
}

export type GroupsCardActions =
  | { type: GroupsCardActionType.GroupAddTextOnChange; value: string }
  | { type: GroupsCardActionType.GroupAddButtonOnClick }
  | { type: GroupsCardActionType.GroupRemoveButtonOnClick; groupId: string };


const groupsCardTypes = new Set<string>(Object.values(GroupsCardActionType));

export function isGroupsCardAction(a: AppAction): a is GroupsCardActions {
  return groupsCardTypes.has(a.type);
}
