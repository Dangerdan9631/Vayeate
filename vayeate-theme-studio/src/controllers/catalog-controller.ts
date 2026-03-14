import type { Catalog, CatalogType } from '../model/schemas';
import { compareVersions, nextPatchVersion } from '../utils/version';
import {
  loadCatalogRefs as loadCatalogRefsOp,
  loadCatalogForDisplay as loadCatalogForDisplayOp,
  setSelectedRef,
  loadCatalog,
  setCatalog,
  refreshCatalogRefs,
  saveCatalog as saveCatalogOp,
  deleteCatalog as deleteCatalogOp,
  syncCatalog as syncCatalogOp,
  loadCatalogSnapshot,
  listCatalogRefs,
  createCatalog as createCatalogOperation,
  type SetState,
} from '../operations/catalog-operations';

export interface CreateCatalogParams {
  name: string;
  type: CatalogType;
}

export function createCatalogWithParams(params: CreateCatalogParams): Catalog {
  return {
    name: params.name,
    version: '1.0.0',
    type: params.type,
    locked: false,
    sources: [],
    tokens: [],
    semanticTokenTypes: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };
}

export async function loadCatalogRefs(setState: SetState): Promise<void> {
  await loadCatalogRefsOp(setState);
}

export async function loadCatalogForDisplay(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await loadCatalogForDisplayOp(setState, name, version);
}

export async function loadCatalogsForDisplay(
  setState: SetState,
  refs: Array<{ name: string; version: string }>,
): Promise<void> {
  for (const ref of refs) {
    await loadCatalogForDisplayOp(setState, ref.name, ref.version);
  }
}

export async function selectCatalogAndLoad(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  const ref = { name, version };
  setSelectedRef(setState, ref);
  await loadCatalog(setState, name, version);
}

export function openCatalogCreateDialog(setState: SetState): void {
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: true });
}

export function closeCatalogCreateDialog(setState: SetState): void {
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
}

async function refreshRefsAndSelect(
  setState: SetState,
  selectName?: string,
  selectVersion?: string,
): Promise<void> {
  const refs = await refreshCatalogRefs(setState);
  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      setSelectedRef(setState, match);
      await loadCatalog(setState, match.name, match.version);
    }
  }
}

export async function createCatalog(
  setState: SetState,
  params: { name: string; type: 'manual' | 'remote' },
): Promise<void> {
  setState({ type: 'SET_IS_CREATING', value: true });
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
  try {
    const catalog = await createCatalogOperation(setState, params);
    await refreshCatalogRefs(setState);
    setCatalog(setState, catalog);
    setSelectedRef(setState, { name: catalog.name, version: catalog.version });
  } finally {
    setState({ type: 'SET_IS_CREATING', value: false });
  }
}

export async function saveCatalog(
  setState: SetState,
  catalog: Catalog,
): Promise<void> {
  await saveCatalogOp(catalog);
  await refreshRefsAndSelect(setState, catalog.name, catalog.version);
}

export async function deleteCatalogVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteCatalogOp(name, version);
  const refs = await refreshCatalogRefs(setState);

  const sameNameRefs = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const lower = sameNameRefs.filter((r) => compareVersions(r.version, version) < 0);
  const higher = sameNameRefs.filter((r) => compareVersions(r.version, version) > 0);
  const next = lower.length > 0 ? lower[lower.length - 1] : higher.length > 0 ? higher[0] : null;

  if (next) {
    setSelectedRef(setState, next);
    await loadCatalog(setState, next.name, next.version);
  } else {
    setSelectedRef(setState, null);
    setCatalog(setState, null);
  }
}

export async function syncCatalog(setState: SetState, catalog: Catalog): Promise<void> {
  const synced = await syncCatalogOp(catalog);
  await saveCatalogOp(synced);
  await refreshRefsAndSelect(setState, synced.name, synced.version);
}

export async function revertCatalogToVersion(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  const snapshot = await loadCatalogSnapshot(name, version);
  if (!snapshot) return;

  const refs = await listCatalogRefs();
  const sameNameRefs = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const highest = sameNameRefs.length > 0 ? sameNameRefs[sameNameRefs.length - 1] : null;

  if (highest) {
    const highestCatalog = await loadCatalogSnapshot(highest.name, highest.version);
    if (highestCatalog && !highestCatalog.locked) {
      await saveCatalogOp({ ...highestCatalog, locked: true });
    }
  }

  const newVersion = highest ? nextPatchVersion(highest.version) : nextPatchVersion(version);
  const reverted: Catalog = {
    ...snapshot,
    version: newVersion,
    locked: false,
  };
  await saveCatalogOp(reverted);
  await refreshRefsAndSelect(setState, reverted.name, reverted.version);
}

export async function restoreCatalogState(
  setState: SetState,
  catalog: Catalog | null,
  deleteVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  setCatalog(setState, catalog);
  if (deleteVersionOnRestore) {
    await deleteCatalogOp(deleteVersionOnRestore.name, deleteVersionOnRestore.version);
    await refreshCatalogRefs(setState);
  }
}
