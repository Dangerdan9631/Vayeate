export enum GroupsCardActionType {
  GroupAddTextOnChange = 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE',
  GroupAddButtonOnClick = 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK',
  GroupRemoveButtonOnClick = 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK',
}

export type GroupsCardActions =
  | { type: GroupsCardActionType.GroupAddTextOnChange; value: string }
  | { type: GroupsCardActionType.GroupAddButtonOnClick }
  | { type: GroupsCardActionType.GroupRemoveButtonOnClick; groupId: string };
