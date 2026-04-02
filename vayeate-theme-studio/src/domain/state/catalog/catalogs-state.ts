import type {
  Catalog,
  CatalogReference,
  CatalogType,
  SourceType,
  TokenType,
} from '../../../model/schemas';

export interface CatalogEntry {
  isLoaded: boolean;
  catalog: Catalog | undefined;
}

/** Map: catalog name -> version -> entry */
export type CatalogStoreMap = Record<string, Record<string, CatalogEntry>>;

export interface CatalogsState {
  selectedRef: CatalogReference | null;
  catalog: Catalog | null;
  /** Catalogs loaded for display (e.g. template page); key = `${name}@${version}` */
  loadedForDisplay: Record<string, Catalog>;
  isCreating: boolean;
  createDialogOpen: boolean;
  createFormName: string;
  createFormType: CatalogType;
  bulkAddDialogOpen: boolean;
  bulkAddText: string;
  tokensSearchText: string;
  newSourceUrl: string;
  newSourceTokenType: TokenType;
  newSourceType: SourceType;
  newTokenKey: string;
  /** List/catalog index: name -> version -> loaded entry */
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
  tokensSearchText: '',
  newSourceUrl: '',
  newSourceTokenType: 'theme',
  newSourceType: 'default',
  newTokenKey: '',
  catalogMap: {},
};

/** Derive catalog refs from the catalog map (sorted by name, then version). */
export function getCatalogRefsFromCatalogMap(map: CatalogStoreMap): CatalogReference[] {
  const refs: CatalogReference[] = [];
  for (const name of Object.keys(map).sort()) {
    for (const version of Object.keys(map[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}
