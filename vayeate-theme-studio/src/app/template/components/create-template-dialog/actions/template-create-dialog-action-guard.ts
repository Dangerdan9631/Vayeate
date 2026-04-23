import { AppAction } from "../../../../core/actions/app-action";
import { TemplateCreateDialogActions, TemplateCreateDialogActionType } from "./template-create-dialog-action-type";

const templateCreateDialogTypes = new Set<string>(Object.values(TemplateCreateDialogActionType));

export function isTemplateCreateDialogAction(a: AppAction): a is TemplateCreateDialogActions {
  return templateCreateDialogTypes.has(a.type);
}
