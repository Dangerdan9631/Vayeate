import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the create-template dialog.
 */
export enum TemplateCreateDialogActionType {
  NameTextOnChange = 'TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  CancelButtonOnClick = 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  OkButtonOnClick = 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
}

/**
 * Union of create-template dialog actions routed through TemplateCreateDialogHandler.
 */
export type TemplateCreateDialogActions =
  | { type: TemplateCreateDialogActionType.NameTextOnChange; value: string }
  | { type: TemplateCreateDialogActionType.CancelButtonOnClick }
  | { type: TemplateCreateDialogActionType.OkButtonOnClick };


const templateCreateDialogTypes = new Set<string>(Object.values(TemplateCreateDialogActionType));

/**
 * Narrows an app action to a create-template dialog action when the type matches.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by TemplateCreateDialogHandler.
 */
export function isTemplateCreateDialogAction(a: AppAction): a is TemplateCreateDialogActions {
  return templateCreateDialogTypes.has(a.type);
}

const templateCreateDialogCoalescers: Partial<Record<TemplateCreateDialogActionType, ActionCoalesceFn>> = {
  [TemplateCreateDialogActionType.NameTextOnChange]: coalesceLatest,
};

/**
 * Merges pending and incoming create-dialog actions when coalescing is supported.
 * @param pending Action already queued for the same control.
 * @param incoming New action replacing or updating the pending one.
 * @returns Coalesced dialog action, or null when no coalescing rule matches.
 */
export function tryCoalesceTemplateCreateDialogAction(
  pending: TemplateCreateDialogActions,
  incoming: TemplateCreateDialogActions,
): TemplateCreateDialogActions | null {
  const coalesce = templateCreateDialogCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as TemplateCreateDialogActions) : null;
}
