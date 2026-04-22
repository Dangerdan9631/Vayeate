import { AppAction } from "../../../../core/actions/app-action";
import { CatalogPageActions, CatalogPageActionType } from "./catalog-page-action-type";

const catalogPageTypes = new Set<string>(Object.values(CatalogPageActionType));

export function isCatalogPageAction(a: AppAction): a is CatalogPageActions {
  return catalogPageTypes.has(a.type);
}
