import type { Catalog } from '../../../model/schema/catalog';
import type { SourceType, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference } from '../../../model/schema/template-schemas';

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
  bulkAddDialog: BulkAddDialogState | null;
  tokensSearchText: string;
  newSource: NewSourceState;
  newTokenKey: string;
  newSemanticTokenSelectorText: string;
  catalogs: CatalogMap;
}



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
  bulkAddDialog: null,
  tokensSearchText: '',
  newSource: emptyNewSource,
  newTokenKey: '',
  newSemanticTokenSelectorText: '',
  catalogs: {},
};
