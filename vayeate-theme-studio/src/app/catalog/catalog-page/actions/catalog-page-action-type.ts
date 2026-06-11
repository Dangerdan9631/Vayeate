import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for catalog page lifecycle.
 */
export enum CatalogPageActionType {
  PageOnLoad = 'CATALOG_PAGE_ON_LOAD',
}

/**
 * Union of catalog page actions handled by `CatalogPageHandler`.
 */
export type CatalogPageActions =
  | { type: CatalogPageActionType.PageOnLoad };

const catalogPageTypes = new Set<string>(Object.values(CatalogPageActionType));

/**
 * Narrows an app action to a catalog page action when the type matches.
 * @param a - Action from the global action queue.
 * @returns True when the action is a catalog page action.
 */
export function isCatalogPageAction(a: AppAction): a is CatalogPageActions {
  return catalogPageTypes.has(a.type);
}
