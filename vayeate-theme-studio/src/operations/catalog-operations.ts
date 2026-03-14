import type { Catalog, CatalogReference } from '../model/schemas';
import type { AppStateUpdate } from '../state/app-state';
import { catalogService } from '../services/catalog-service';
import { syncCatalogTokens } from '../services/catalog-sync';
import { compareVersions, nextPatchVersion } from '../utils/version';

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

export async function refreshRefsAndSelect(
  setState: SetState,
  selectName?: string,
  selectVersion?: string,
): Promise<void> {
  const refs = await catalogService.listCatalogs();
  setState({ type: 'SET_CATALOG_REFS', refs });

  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      setState({ type: 'SET_SELECTED_REF', ref: match });
      await loadCatalog(setState, match.name, match.version);
    }
  }
}

export async function saveCatalogAndRefresh(catalog: Catalog, setState: SetState): Promise<void> {
  await catalogService.saveCatalog(catalog);
  await refreshRefsAndSelect(setState, catalog.name, catalog.version);
}

export async function deleteCatalogVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await catalogService.deleteCatalog(name, version);
  const refs = await catalogService.listCatalogs();
  setState({ type: 'SET_CATALOG_REFS', refs });

  const sameNameRefs = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));

  const lower = sameNameRefs.filter((r) => compareVersions(r.version, version) < 0);
  const higher = sameNameRefs.filter((r) => compareVersions(r.version, version) > 0);
  const next = lower.length > 0 ? lower[lower.length - 1] : higher.length > 0 ? higher[0] : null;

  if (next) {
    setState({ type: 'SET_SELECTED_REF', ref: next });
    await loadCatalog(setState, next.name, next.version);
  } else {
    setState({ type: 'SET_SELECTED_REF', ref: null });
    setState({ type: 'SET_CATALOG', catalog: null });
  }
}

export async function syncCatalogAndSave(
  setState: SetState,
  catalog: Catalog,
  catalogUndoPush: CatalogUndoPush | null,
): Promise<void> {
  const prev: CatalogPaneState = {
    catalog,
    undoMetadata: !catalog.locked
      ? {
          deleteVersionOnRestore: {
            name: catalog.name,
            version: nextPatchVersion(catalog.version),
          },
        }
      : undefined,
  };
  const result = await syncCatalogTokens(catalog.sources, (url) => catalogService.fetchUrl(url));
  const version = catalog.locked ? nextPatchVersion(catalog.version) : catalog.version;
  const synced: Catalog = {
    ...catalog,
    tokens: result.tokens,
    semanticTokenTypes: result.semanticTokenTypes,
    semanticTokenModifiers: result.semanticTokenModifiers,
    semanticTokenLanguages: result.semanticTokenLanguages,
    version,
    locked: true,
  };
  const next: CatalogPaneState = { catalog: synced };
  catalogUndoPush?.('Sync catalog', prev, next);
  await saveCatalogAndRefresh(synced, setState);
}

export async function revertCatalogToVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  const snapshot = await catalogService.loadCatalog(name, version);
  if (!snapshot) {
    return;
  }

  const refs = await catalogService.listCatalogs();
  const sameNameRefs = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const highest = sameNameRefs.length > 0 ? sameNameRefs[sameNameRefs.length - 1] : null;

  if (highest) {
    const highestCatalog = await catalogService.loadCatalog(highest.name, highest.version);
    if (highestCatalog && !highestCatalog.locked) {
      await catalogService.saveCatalog({ ...highestCatalog, locked: true });
    }
  }

  const newVersion = highest ? nextPatchVersion(highest.version) : nextPatchVersion(version);
  const reverted: Catalog = {
    ...snapshot,
    version: newVersion,
    locked: false,
  };
  await saveCatalogAndRefresh(reverted, setState);
}

export async function restoreCatalogState(
  setState: SetState,
  catalog: Catalog | null,
  deleteVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  setState({ type: 'SET_CATALOG', catalog });
  if (deleteVersionOnRestore) {
    await catalogService.deleteCatalog(
      deleteVersionOnRestore.name,
      deleteVersionOnRestore.version,
    );
    const refs = await catalogService.listCatalogs();
    setState({ type: 'SET_CATALOG_REFS', refs });
  }
}
