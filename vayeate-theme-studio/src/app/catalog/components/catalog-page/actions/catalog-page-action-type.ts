import { AppAction } from "../../../../core/components/action-queue/app-action";

export enum CatalogPageActionType {
  PageOnLoad = 'CATALOG_PAGE_ON_LOAD',
}

export type CatalogPageActions =
  | { type: CatalogPageActionType.PageOnLoad };

const catalogPageTypes = new Set<string>(Object.values(CatalogPageActionType));

export function isCatalogPageAction(a: AppAction): a is CatalogPageActions {
  return catalogPageTypes.has(a.type);
}
