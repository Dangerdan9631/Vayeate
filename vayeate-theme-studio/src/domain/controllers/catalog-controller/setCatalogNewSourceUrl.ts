import { setCatalogNewSourceUrl as setCatalogNewSourceUrlOp, type SetState } from '../../operations/catalog-operations';

export function setCatalogNewSourceUrl(setState: SetState, value: string): void {
  setCatalogNewSourceUrlOp(setState, value);
}
