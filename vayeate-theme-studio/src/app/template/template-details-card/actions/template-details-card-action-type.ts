import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the template details card.
 */
export enum TemplateDetailsCardActionType {
  DeleteVersionButtonOnClick = 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  LockButtonOnClick = 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK',
}

/**
 * Union of template details card actions routed through TemplateDetailsCardHandler.
 */
export type TemplateDetailsCardActions =
  | { type: TemplateDetailsCardActionType.DeleteVersionButtonOnClick }
  | { type: TemplateDetailsCardActionType.LockButtonOnClick };


const templateDetailsCardTypes = new Set<string>(Object.values(TemplateDetailsCardActionType));

/**
 * Narrows an app action to a template details card action when the type matches.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by TemplateDetailsCardHandler.
 */
export function isTemplateDetailsCardAction(a: AppAction): a is TemplateDetailsCardActions {
  return templateDetailsCardTypes.has(a.type);
}
