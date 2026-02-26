export type TokenType = 'theme' | 'token' | 'semantic token';

export interface Token {
  readonly key: string;
  readonly type: TokenType;
}
