export enum CatalogPageActionType {
  PageOnLoad = 'CATALOG_PAGE_ON_LOAD',
}

export type CatalogPageActions =
  | { type: CatalogPageActionType.PageOnLoad };
