import type { CatalogName, Url, Version } from './brands.js';
import type { Token } from './token.js';

export type CatalogType = 'manual' | 'remote';

export type SourceType = 'default';

export interface Source {
  readonly url: Url;
  readonly type: SourceType;
}

export interface Catalog {
  readonly name: CatalogName;
  readonly version: Version;
  readonly type: CatalogType;
  readonly locked: boolean;
  readonly sources: readonly Source[];
  readonly tokens: readonly Token[];
}
