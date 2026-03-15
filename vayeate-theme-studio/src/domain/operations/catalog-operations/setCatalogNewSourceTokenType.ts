import type { TokenType } from '../../../model/schemas';
import type { SetState } from './types';

export function setCatalogNewSourceTokenType(setState: SetState, value: TokenType): void {
  setState({ type: 'SET_CATALOG_NEW_SOURCE_TOKEN_TYPE', value });
}
