import { setCatalogBulkAddText as setCatalogBulkAddTextOp, type SetState } from '../../../operations/catalog-operations';

export function setCatalogBulkAddText(setState: SetState, value: string): void {
  setCatalogBulkAddTextOp(setState, value);
}

