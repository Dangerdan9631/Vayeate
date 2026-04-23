import { AppAction } from "../../../../core/actions/app-action";
import { TemplateCatalogsCardActions, TemplateCatalogsCardActionType } from "./template-catalogs-card-action-type";

const templateCatalogsCardTypes = new Set<string>(Object.values(TemplateCatalogsCardActionType));

export function isTemplateCatalogsCardAction(a: AppAction): a is TemplateCatalogsCardActions {
  return templateCatalogsCardTypes.has(a.type);
}
