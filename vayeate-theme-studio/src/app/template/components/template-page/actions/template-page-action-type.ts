export enum TemplatePageActionType {
  PageOnLoad = 'TEMPLATE_PAGE_ON_LOAD',
}

export type TemplatePageActions =
  | { type: TemplatePageActionType.PageOnLoad };
