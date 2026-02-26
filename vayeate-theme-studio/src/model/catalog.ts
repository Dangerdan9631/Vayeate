import type { Token } from './token.js';

export type CatalogType = 'manual' | 'remote';

export type SourceType = 'default';

export interface Source {
  readonly url: string;
  readonly type: SourceType;
}

export interface Catalog {
  readonly name: string;
  readonly version: string;
  readonly type: CatalogType;
  readonly locked: boolean;
  readonly sources: readonly Source[];
  readonly tokens: readonly Token[];
}
