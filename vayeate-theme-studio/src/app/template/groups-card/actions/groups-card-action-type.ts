import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the template groups card.
 */
export enum GroupsCardActionType {
  GroupAddTextOnChange = 'TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE',
  GroupAddButtonOnClick = 'TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK',
  GroupRemoveButtonOnClick = 'TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK',
}

/**
 * Union of groups card actions routed through GroupsCardHandler.
 */
export type GroupsCardActions =
  | { type: GroupsCardActionType.GroupAddTextOnChange; value: string }
  | { type: GroupsCardActionType.GroupAddButtonOnClick }
  | { type: GroupsCardActionType.GroupRemoveButtonOnClick; groupId: string };


const groupsCardTypes = new Set<string>(Object.values(GroupsCardActionType));

/**
 * Narrows an app action to a groups card action when the type matches.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by GroupsCardHandler.
 */
export function isGroupsCardAction(a: AppAction): a is GroupsCardActions {
  return groupsCardTypes.has(a.type);
}

const groupsCardCoalescers: Partial<Record<GroupsCardActionType, ActionCoalesceFn>> = {
  [GroupsCardActionType.GroupAddTextOnChange]: coalesceLatest,
};

/**
 * Merges pending and incoming groups card actions when coalescing is supported.
 * @param pending Action already queued for the same control.
 * @param incoming New action replacing or updating the pending one.
 * @returns Coalesced groups card action, or null when no coalescing rule matches.
 */
export function tryCoalesceGroupsCardAction(
  pending: GroupsCardActions,
  incoming: GroupsCardActions,
): GroupsCardActions | null {
  const coalesce = groupsCardCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as GroupsCardActions) : null;
}
