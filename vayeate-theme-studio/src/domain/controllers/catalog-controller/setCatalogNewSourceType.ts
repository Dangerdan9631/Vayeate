import { setCatalogNewSourceType as setCatalogNewSourceTypeOp, type SetState } from '../../operations/catalog-operations';
import type { SourceType } from '../../../model/schemas';

export function setCatalogNewSourceType(setState: SetState, value: SourceType): void {
  setCatalogNewSourceTypeOp(setState, value);
}
