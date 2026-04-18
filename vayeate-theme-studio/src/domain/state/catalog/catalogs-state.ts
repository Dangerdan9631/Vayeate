import type { Catalog } from '../../../model/schema/catalog';
import type { CatalogType, SourceType, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference } from '../../../model/schema/template-schemas';

export interface CatalogBulkAddParseSnapshot {
  errorMessage: string | null;
  counts: Record<TokenType, number> | null;
  newCount: number;
  duplicateCount: number;
}

export interface CatalogEntry {
  isLoaded: boolean;
  catalog: Catalog | undefined;
}

export type CatalogStoreMap = Record<string, Record<string, CatalogEntry>>;

export interface CatalogsState {
  selectedRef: CatalogReference | null;
  catalog: Catalog | null;
  loadedForDisplay: Record<string, Catalog>;
  isCreating: boolean;
  createDialogOpen: boolean;
  createFormName: string;
  createFormType: CatalogType;
  bulkAddDialogOpen: boolean;
  bulkAddText: string;
  bulkAddParse: CatalogBulkAddParseSnapshot | null;
  tokensSearchText: string;
  newSourceUrl: string;
  newSourceTokenType: TokenType;
  newSourceType: SourceType;
  newTokenKey: string;
  newSemanticTokenSelectorText: string;
  catalogMap: CatalogStoreMap;
}

export const initialCatalogsState: CatalogsState = {
  selectedRef: null,
  catalog: null,
  loadedForDisplay: {},
  isCreating: false,
  createDialogOpen: false,
  createFormName: '',
  createFormType: 'manual',
  bulkAddDialogOpen: false,
  bulkAddText: '',
  bulkAddParse: null,
  tokensSearchText: '',
  newSourceUrl: '',
  newSourceTokenType: 'theme',
  newSourceType: 'default',
  newTokenKey: '',
  newSemanticTokenSelectorText: '',
  catalogMap: {},
};

export function getCatalogRefsFromCatalogMap(map: CatalogStoreMap): CatalogReference[] {
  const refs: CatalogReference[] = [];
  for (const name of Object.keys(map).sort()) {
    for (const version of Object.keys(map[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}
