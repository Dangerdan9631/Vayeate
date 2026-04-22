import { AppAction } from "../../../../core/actions/app-action";
import { CatalogDetailsCardActions, CatalogDetailsCardActionType } from "./catalog-details-card-action-type";

const catalogDetailsCardTypes = new Set<string>(Object.values(CatalogDetailsCardActionType));

export function isCatalogDetailsCardAction(a: AppAction): a is CatalogDetailsCardActions {
  return catalogDetailsCardTypes.has(a.type);
}
