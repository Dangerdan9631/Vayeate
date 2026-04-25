import { CatalogName, Version } from "../../../../../model/schema/primitives";
import { AppAction } from "../../../../core/components/action-queue/app-action";

export enum CatalogsCardActionType {
  CatalogsListOnCommit = 'CATALOG_CATALOGS_LIST_ON_COMMIT',
  CatalogVersionsListOnCommit = 'CATALOG_CATALOG_VERSIONS_LIST_ON_COMMIT',
  CatalogsCreateButtonOnClick = 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK',
}

export type CatalogsCardActions =
  | { type: CatalogsCardActionType.CatalogsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogsCardActionType.CatalogVersionsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogsCardActionType.CatalogsCreateButtonOnClick };


const catalogsCardTypes = new Set<string>(Object.values(CatalogsCardActionType));

export function isCatalogsCardAction(a: AppAction): a is CatalogsCardActions {
  return catalogsCardTypes.has(a.type);
}
