import { AppAction } from "../../../../core/actions/app-action";
import { CatalogCreateDialogActions, CatalogCreateDialogActionType } from "./catalog-create-dialog-action-type";

const catalogCreateDialogTypes = new Set<string>(Object.values(CatalogCreateDialogActionType));

export function isCatalogCreateDialogAction(a: AppAction): a is CatalogCreateDialogActions {
    return catalogCreateDialogTypes.has(a.type);
}