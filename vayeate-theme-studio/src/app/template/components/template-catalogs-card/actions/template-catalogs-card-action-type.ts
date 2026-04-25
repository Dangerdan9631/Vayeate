import { CatalogName, Version } from "../../../../../model/schema/primitives";
import { AppAction } from "../../../../core/action-queue/app-action";

export enum TemplateCatalogsCardActionType {
  UpdateAllButtonOnClick = 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK',
  CatalogCheckboxOnToggle = 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE',
  CatalogVersionListOnCommit = 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT',
}

export type TemplateCatalogsCardActions =
  | { type: TemplateCatalogsCardActionType.UpdateAllButtonOnClick }
  | { type: TemplateCatalogsCardActionType.CatalogCheckboxOnToggle; catalogName: CatalogName }
  | { type: TemplateCatalogsCardActionType.CatalogVersionListOnCommit; value: Version; catalogName: CatalogName };


const templateCatalogsCardTypes = new Set<string>(Object.values(TemplateCatalogsCardActionType));

export function isTemplateCatalogsCardAction(a: AppAction): a is TemplateCatalogsCardActions {
  return templateCatalogsCardTypes.has(a.type);
}
