import { AppAction } from "../../../../core/actions/app-action";
import { CatalogsCardActions, CatalogsCardActionType } from "./catalogs-card-action-type";

const catalogsCardTypes = new Set<string>(Object.values(CatalogsCardActionType));

export function isCatalogsCardAction(a: AppAction): a is CatalogsCardActions {
  return catalogsCardTypes.has(a.type);
}
