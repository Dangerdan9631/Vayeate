import { setCatalogNewTokenKey as setCatalogNewTokenKeyOp, type SetState } from '../../../operations/catalog-operations';

export function setCatalogNewTokenKey(setState: SetState, value: string): void {
  setCatalogNewTokenKeyOp(setState, value);
}

