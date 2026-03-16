import { setCatalogNewSourceTokenType as setCatalogNewSourceTokenTypeOp, type SetState } from '../../operations/catalog-operations';
import type { TokenType } from '../../../model/schemas';

export function setCatalogNewSourceTokenType(setState: SetState, value: TokenType): void {
  setCatalogNewSourceTokenTypeOp(setState, value);
}
