import { AppAction } from "../../../core/action-queue/app-action";

export enum TemplateCreateDialogActionType {
  NameTextOnChange = 'TEMPLATE_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  CancelButtonOnClick = 'TEMPLATE_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  OkButtonOnClick = 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
}

export type TemplateCreateDialogActions =
  | { type: TemplateCreateDialogActionType.NameTextOnChange; value: string }
  | { type: TemplateCreateDialogActionType.CancelButtonOnClick }
  | { type: TemplateCreateDialogActionType.OkButtonOnClick };


const templateCreateDialogTypes = new Set<string>(Object.values(TemplateCreateDialogActionType));

export function isTemplateCreateDialogAction(a: AppAction): a is TemplateCreateDialogActions {
  return templateCreateDialogTypes.has(a.type);
}
