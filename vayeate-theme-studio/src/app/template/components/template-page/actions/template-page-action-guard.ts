import { AppAction } from "../../../../core/actions/app-action";
import { TemplatePageActions, TemplatePageActionType } from "./template-page-action-type";

const templatePageTypes = new Set<string>(Object.values(TemplatePageActionType));

export function isTemplatePageAction(a: AppAction): a is TemplatePageActions {
  return templatePageTypes.has(a.type);
}
