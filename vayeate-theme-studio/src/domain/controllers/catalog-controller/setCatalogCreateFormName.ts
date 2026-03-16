import { setCatalogCreateFormName as setCatalogCreateFormNameOp, type SetState } from '../../operations/catalog-operations';

export function setCatalogCreateFormName(setState: SetState, value: string): void {
  setCatalogCreateFormNameOp(setState, value);
}
