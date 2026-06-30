import { TemplateName, Version } from "../../../../model/schema/primitives";
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the Templates list card.
 */
export enum TemplatesCardActionType {
  TemplatesListOnCommit = 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT',
  TemplatesCreateButtonOnClick = 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK',
}

/**
 * Union of Templates list card actions routed through TemplatesCardHandler.
 */
export type TemplatesCardActions =
  | { type: TemplatesCardActionType.TemplatesListOnCommit; name: TemplateName; version: Version }
  | { type: TemplatesCardActionType.TemplatesCreateButtonOnClick };


const templatesCardTypes = new Set<string>(Object.values(TemplatesCardActionType));

/**
 * Narrows an app action to a Templates list card action when the type matches.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by TemplatesCardHandler.
 */
export function isTemplatesCardAction(a: AppAction): a is TemplatesCardActions {
  return templatesCardTypes.has(a.type);
}
