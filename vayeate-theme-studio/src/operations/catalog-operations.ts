import type { Catalog, CatalogReference } from '../model/schemas';
import type { AppStateUpdate } from '../state/app-state';
import { catalogService } from '../services/catalog-service';
import { syncCatalogTokens } from '../services/catalog-sync';
import { nextPatchVersion } from '../utils/version';

export type SetState = (update: AppStateUpdate) => void;

export interface CatalogPaneState {
  catalog: Catalog | null;
  undoMetadata?: { deleteVersionOnRestore?: { name: string; version: string } };
}

export type CatalogUndoPush = (label: string, prev: CatalogPaneState, next: CatalogPaneState) => void;

export function setCatalogRefs(setState: SetState, refs: CatalogReference[]): void {
  setState({ type: 'SET_CATALOG_REFS', refs });
}

export function setSelectedRef(setState: SetState, ref: CatalogReference | null): void {
  setState({ type: 'SET_SELECTED_REF', ref });
}

export function setCatalog(setState: SetState, catalog: Catalog | null): void {
  setState({ type: 'SET_CATALOG', catalog });
}

export async function loadCatalogRefs(setState: SetState): Promise<CatalogReference[]> {
  const refs = await catalogService.listCatalogs();
  setState({ type: 'SET_CATALOG_REFS', refs });
  return refs;
}

export async function createCatalog(
  _setState: SetState,
  params: { name: string; type: 'manual' | 'remote' },
): Promise<Catalog> {
  const catalog = await catalogService.createCatalog(params);
  return catalog;
}

export async function loadCatalog(
  setState: SetState,
  name: string,
  version: string,
): Promise<Catalog | null> {
  const loaded = await catalogService.loadCatalog(name, version);
  setState({ type: 'SET_CATALOG', catalog: loaded });
  return loaded;
}

export async function loadCatalogForDisplay(
  setState: SetState,
  name: string,
  version: string,
): Promise<Catalog | null> {
  const loaded = await catalogService.loadCatalog(name, version);
  setState({ type: 'SET_LOADED_CATALOG_FOR_DISPLAY', name, version, catalog: loaded });
  return loaded;
}

/** List catalogs and set refs in state. Single responsibility: refresh ref list. */
export async function refreshCatalogRefs(setState: SetState): Promise<CatalogReference[]> {
  const refs = await catalogService.listCatalogs();
  setState({ type: 'SET_CATALOG_REFS', refs });
  return refs;
}

/** Persist catalog to disk only. Single responsibility: save. */
export async function saveCatalog(catalog: Catalog): Promise<void> {
  await catalogService.saveCatalog(catalog);
}

/** Delete one catalog version from disk. Single responsibility: delete. */
export async function deleteCatalog(name: string, version: string): Promise<void> {
  await catalogService.deleteCatalog(name, version);
}

/** Sync tokens from sources and return updated catalog. No setState, no save. Single responsibility: sync. */
export async function syncCatalog(
  catalog: Catalog,
  fetchUrl: (url: string) => Promise<string> = (url) => catalogService.fetchUrl(url),
): Promise<Catalog> {
  const result = await syncCatalogTokens(catalog.sources, fetchUrl);
  const version = catalog.locked ? nextPatchVersion(catalog.version) : catalog.version;
  return {
    ...catalog,
    tokens: result.tokens,
    semanticTokenTypes: result.semanticTokenTypes,
    semanticTokenModifiers: result.semanticTokenModifiers,
    semanticTokenLanguages: result.semanticTokenLanguages,
    version,
    locked: true,
  };
}

/** Load catalog from disk without updating state. Single responsibility: read. */
export async function loadCatalogSnapshot(
  name: string,
  version: string,
): Promise<Catalog | null> {
  return catalogService.loadCatalog(name, version);
}

/** List catalog refs from disk without updating state. Single responsibility: read. */
export async function listCatalogRefs(): Promise<CatalogReference[]> {
  return catalogService.listCatalogs();
}
