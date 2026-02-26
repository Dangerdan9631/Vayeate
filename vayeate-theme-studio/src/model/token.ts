import type { TokenKey } from './brands.js';

export type TokenType = 'theme' | 'token' | 'semantic token';

export interface Token {
  readonly key: TokenKey;
  readonly type: TokenType;
}
