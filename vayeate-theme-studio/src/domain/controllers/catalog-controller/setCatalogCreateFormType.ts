import { setCatalogCreateFormType as setCatalogCreateFormTypeOp, type SetState } from '../../operations/catalog-operations';
import type { CatalogType } from '../../../model/schemas';

export function setCatalogCreateFormType(setState: SetState, value: CatalogType): void {
  setCatalogCreateFormTypeOp(setState, value);
}
