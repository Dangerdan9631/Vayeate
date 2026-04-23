import { AppAction } from "../../../../core/actions/app-action";
import { TemplatesCardActions, TemplatesCardActionType } from "./templates-card-action-type";

const templatesCardTypes = new Set<string>(Object.values(TemplatesCardActionType));

export function isTemplatesCardAction(a: AppAction): a is TemplatesCardActions {
  return templatesCardTypes.has(a.type);
}
