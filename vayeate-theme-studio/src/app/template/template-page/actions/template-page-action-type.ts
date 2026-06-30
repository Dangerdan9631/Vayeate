import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the Templates page lifecycle.
 */
export enum TemplatePageActionType {
  PageOnLoad = 'TEMPLATE_PAGE_ON_LOAD',
}

/**
 * Union of Templates page actions routed through TemplatePageHandler.
 */
export type TemplatePageActions =
  | { type: TemplatePageActionType.PageOnLoad };


const templatePageTypes = new Set<string>(Object.values(TemplatePageActionType));

/**
 * Narrows an app action to a Templates page action when the type matches.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by TemplatePageHandler.
 */
export function isTemplatePageAction(a: AppAction): a is TemplatePageActions {
  return templatePageTypes.has(a.type);
}
