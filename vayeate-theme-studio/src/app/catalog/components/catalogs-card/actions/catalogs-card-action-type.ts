import { CatalogName, Version } from "../../../../../model/schema/primitives";

export enum CatalogsCardActionType {
  CatalogsListOnCommit = 'CATALOG_CATALOGS_LIST_ON_COMMIT',
  CatalogVersionsListOnCommit = 'CATALOG_CATALOG_VERSIONS_LIST_ON_COMMIT',
  CatalogsCreateButtonOnClick = 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK',
}

export type CatalogsCardActions =
  | { type: CatalogsCardActionType.CatalogsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogsCardActionType.CatalogVersionsListOnCommit; name: CatalogName; version: Version }
  | { type: CatalogsCardActionType.CatalogsCreateButtonOnClick };
