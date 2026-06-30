import { CatalogName, Version } from "../../../../model/schema/primitives";
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the catalogs picker card.
 */
export enum CatalogsCardActionType {
  CatalogsListOnCommit = 'CATALOG_CATALOGS_LIST_ON_COMMIT',
  CatalogVersionsListOnCommit = 'CATALOG_CATALOG_VERSIONS_LIST_ON_COMMIT',
  CatalogsCreateButtonOnClick = 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK',
}

/**
 * Union of catalogs card actions handled by `CatalogsCardHandler`.
 */
export type CatalogsCardActions =
  | { type: CatalogsCardActionType.CatalogsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogsCardActionType.CatalogVersionsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogsCardActionType.CatalogsCreateButtonOnClick };


const catalogsCardTypes = new Set<string>(Object.values(CatalogsCardActionType));

/**
 * Narrows an app action to a catalogs card action when the type matches.
 * @param a - Action from the global action queue.
 * @returns True when the action is a catalogs card action.
 */
export function isCatalogsCardAction(a: AppAction): a is CatalogsCardActions {
  return catalogsCardTypes.has(a.type);
}
