import { CatalogName, Version } from "../../../../model/schema/primitives";
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the template catalogs card.
 */
export enum TemplateCatalogsCardActionType {
  UpdateAllButtonOnClick = 'TEMPLATE_DETAILS_UPDATE_ALL_BUTTON_ON_CLICK',
  CatalogCheckboxOnToggle = 'TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE',
  CatalogVersionListOnCommit = 'TEMPLATE_DETAILS_CATALOG_VERSION_LIST_ON_COMMIT',
}

/**
 * Union of template catalogs card actions routed through TemplateCatalogsCardHandler.
 */
export type TemplateCatalogsCardActions =
  | { type: TemplateCatalogsCardActionType.UpdateAllButtonOnClick }
  | { type: TemplateCatalogsCardActionType.CatalogCheckboxOnToggle; catalogName: CatalogName }
  | { type: TemplateCatalogsCardActionType.CatalogVersionListOnCommit; value: Version; catalogName: CatalogName };


const templateCatalogsCardTypes = new Set<string>(Object.values(TemplateCatalogsCardActionType));

/**
 * Narrows an app action to a template catalogs card action when the type matches.
 * @param a Action from the shared action queue.
 * @returns True when the action is handled by TemplateCatalogsCardHandler.
 */
export function isTemplateCatalogsCardAction(a: AppAction): a is TemplateCatalogsCardActions {
  return templateCatalogsCardTypes.has(a.type);
}
