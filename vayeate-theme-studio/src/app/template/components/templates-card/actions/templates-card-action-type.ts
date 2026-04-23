import { TemplateName, Version } from "../../../../../model/schema/primitives";

export enum TemplatesCardActionType {
  TemplatesListOnCommit = 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT',
  TemplatesCreateButtonOnClick = 'TEMPLATE_TEMPLATES_CREATE_BUTTON_ON_CLICK',
}

export type TemplatesCardActions =
  | { type: TemplatesCardActionType.TemplatesListOnCommit; name: TemplateName; version: Version }
  | { type: TemplatesCardActionType.TemplatesCreateButtonOnClick };
