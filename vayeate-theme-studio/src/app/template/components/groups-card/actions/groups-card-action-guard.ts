import { AppAction } from "../../../../core/actions/app-action";
import { GroupsCardActions, GroupsCardActionType } from "./groups-card-action-type";

const groupsCardTypes = new Set<string>(Object.values(GroupsCardActionType));

export function isGroupsCardAction(a: AppAction): a is GroupsCardActions {
  return groupsCardTypes.has(a.type);
}
