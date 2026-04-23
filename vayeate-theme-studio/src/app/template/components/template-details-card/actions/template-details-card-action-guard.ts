import { AppAction } from "../../../../core/actions/app-action";
import { TemplateDetailsCardActions, TemplateDetailsCardActionType } from "./template-details-card-action-type";

const templateDetailsCardTypes = new Set<string>(Object.values(TemplateDetailsCardActionType));

export function isTemplateDetailsCardAction(a: AppAction): a is TemplateDetailsCardActions {
  return templateDetailsCardTypes.has(a.type);
}
