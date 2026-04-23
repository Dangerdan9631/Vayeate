export enum TemplateDetailsCardActionType {
  DeleteVersionButtonOnClick = 'TEMPLATE_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK',
  LockButtonOnClick = 'TEMPLATE_DETAILS_LOCK_BUTTON_ON_CLICK',
}

export type TemplateDetailsCardActions =
  | { type: TemplateDetailsCardActionType.DeleteVersionButtonOnClick }
  | { type: TemplateDetailsCardActionType.LockButtonOnClick };
