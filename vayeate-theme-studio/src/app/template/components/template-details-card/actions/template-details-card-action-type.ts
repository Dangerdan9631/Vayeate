import { AppAction } from "../../../../core/components/action-queue/app-action";

export enum TemplateDetailsCardActionType {
  DeleteVersionButtonOnClick = 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  LockButtonOnClick = 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK',
}

export type TemplateDetailsCardActions =
  | { type: TemplateDetailsCardActionType.DeleteVersionButtonOnClick }
  | { type: TemplateDetailsCardActionType.LockButtonOnClick };


const templateDetailsCardTypes = new Set<string>(Object.values(TemplateDetailsCardActionType));

export function isTemplateDetailsCardAction(a: AppAction): a is TemplateDetailsCardActions {
  return templateDetailsCardTypes.has(a.type);
}
