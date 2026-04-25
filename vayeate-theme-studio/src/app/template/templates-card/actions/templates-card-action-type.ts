import { TemplateName, Version } from "../../../../model/schema/primitives";
import { AppAction } from "../../../core/action-queue/app-action";

export enum TemplatesCardActionType {
  TemplatesListOnCommit = 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT',
  TemplatesCreateButtonOnClick = 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK',
}

export type TemplatesCardActions =
  | { type: TemplatesCardActionType.TemplatesListOnCommit; name: TemplateName; version: Version }
  | { type: TemplatesCardActionType.TemplatesCreateButtonOnClick };


const templatesCardTypes = new Set<string>(Object.values(TemplatesCardActionType));

export function isTemplatesCardAction(a: AppAction): a is TemplatesCardActions {
  return templatesCardTypes.has(a.type);
}
