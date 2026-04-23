import { AppAction } from "../../../../core/actions/app-action";

export enum TemplatePageActionType {
  PageOnLoad = 'TEMPLATE_PAGE_ON_LOAD',
}

export type TemplatePageActions =
  | { type: TemplatePageActionType.PageOnLoad };


const templatePageTypes = new Set<string>(Object.values(TemplatePageActionType));

export function isTemplatePageAction(a: AppAction): a is TemplatePageActions {
  return templatePageTypes.has(a.type);
}
