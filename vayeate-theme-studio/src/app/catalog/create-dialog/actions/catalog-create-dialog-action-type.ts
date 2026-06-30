import { CatalogType } from "../../../../model/schema/primitives";
import { AppAction } from "../../../core/action-queue/app-action";

/**
 * Action type constants for the create-catalog dialog.
 */
export enum CatalogCreateDialogActionType {
    NameTextOnChange = 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
    TypeListOnCommit = 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT',
    CancelButtonOnClick = 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
    OkButtonOnClick = 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
}

/**
 * Union of create-catalog dialog actions handled by `CatalogCreateDialogHandler`.
 */
export type CatalogCreateDialogActions =
    | { type: CatalogCreateDialogActionType.NameTextOnChange; value: string }
    | { type: CatalogCreateDialogActionType.TypeListOnCommit; value: CatalogType }
    | { type: CatalogCreateDialogActionType.CancelButtonOnClick }
    | { type: CatalogCreateDialogActionType.OkButtonOnClick };


const catalogCreateDialogTypes = new Set<string>(Object.values(CatalogCreateDialogActionType));

/**
 * Narrows an app action to a create-catalog dialog action when the type matches.
 * @param a - Action from the global action queue.
 * @returns True when the action is a create-catalog dialog action.
 */
export function isCatalogCreateDialogAction(a: AppAction): a is CatalogCreateDialogActions {
    return catalogCreateDialogTypes.has(a.type);
}
