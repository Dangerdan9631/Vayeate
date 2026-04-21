import type { Catalog } from '../../../model/schema/catalog';
import type { CatalogType, SourceType, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference } from '../../../model/schema/template-schemas';

export interface CreateCatalogDialogState {
  isOpen: boolean;
  name: string;
  type: CatalogType;
  errorMessage: string | null;
}

export interface BulkAddDialogState {
  isOpen: boolean;
  text: string;
  errorMessage: string | null;
  counts: Record<TokenType, number> | null;
  newCount: number;
  duplicateCount: number;
}

export interface NewSourceState {
  url: string;
  tokenType: TokenType;
  type: SourceType;
}

export interface CatalogState {
  isLoaded: boolean;
  catalog: Catalog | null;
}

export interface CatalogVersions {
  [version: string]: CatalogState;
}

export interface CatalogMap {
  [name: string]: CatalogVersions;
}

export interface CatalogsStateV2 {
  selectedRef: CatalogReference | null;
  selectedCatalog: Catalog | null;
  createCatalogDialog: CreateCatalogDialogState | null;
  bulkAddDialog: BulkAddDialogState | null;
  tokensSearchText: string;
  newSource: NewSourceState;
  newTokenKey: string;
  newSemanticTokenSelectorText: string;
  catalogs: CatalogMap;
}

export const emptyCreateCatalogData: CreateCatalogDialogState = {
  isOpen: false,
  name: '',
  type: 'manual',
  errorMessage: null,
};

export const emptyBulkAddData: BulkAddDialogState = {
  isOpen: false,
  text: '',
  errorMessage: null,
  counts: null,
  newCount: 0,
  duplicateCount: 0,
};

export const emptyNewSource: NewSourceState = {
  url: '',
  tokenType: 'theme',
  type: 'default',
};

export const initialCatalogsStateV2: CatalogsStateV2 = {
  selectedRef: null,
  selectedCatalog: null,
  createCatalogDialog: null,
  bulkAddDialog: null,
  tokensSearchText: '',
  newSource: emptyNewSource,
  newTokenKey: '',
  newSemanticTokenSelectorText: '',
  catalogs: {},
};
