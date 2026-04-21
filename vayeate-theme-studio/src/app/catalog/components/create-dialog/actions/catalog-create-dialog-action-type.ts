import { CatalogType } from "../../../../../model/schema/primitives";

export enum CatalogCreateDialogActionType {
    NameTextOnChange = 'CATALOG_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
    TypeListOnCommit = 'CATALOG_CREATE_DIALOG_TYPE_LIST_ON_COMMIT',
    CancelButtonOnClick = 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
    OkButtonOnClick = 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
}

export type CatalogCreateDialogActions =
    | { type: CatalogCreateDialogActionType.NameTextOnChange; value: string }
    | { type: CatalogCreateDialogActionType.TypeListOnCommit; value: CatalogType }
    | { type: CatalogCreateDialogActionType.CancelButtonOnClick }
    | { type: CatalogCreateDialogActionType.OkButtonOnClick };