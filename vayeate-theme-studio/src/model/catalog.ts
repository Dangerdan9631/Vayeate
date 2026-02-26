export type CatalogType = 'manual' | 'remote';

export type SourceType = 'default';

export interface Source {
  url: string;
  type: SourceType;
}

export type TokenType = 'theme' | 'token' | 'semantic token';

export interface Token {
  key: string;
  type: TokenType;
}

export interface Catalog {
  name: string;
  version: number;
  type: CatalogType;
  locked: boolean;
  sources: Source[];
  tokens: Token[];
}
