import type { Catalog, CatalogType, Source, SourceType, Token, TokenKey, TokenType } from '../model/schemas';
import { mergeSemanticSelectorInto } from '../core/semantic-token';
import { parseThemeJson } from '../services/theme-parser';
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
  setCatalogCreateFormName,
  setCatalogCreateFormType,
  setCatalogBulkAddDialogOpen,
  setCatalogBulkAddText,
  setCatalogNewSourceUrl,
  setCatalogNewSourceTokenType,
  setCatalogNewSourceType,
  setCatalogNewTokenKey,
  type SetState,
} from '../operations/catalog-operations';
import { setCurrentUndoStackId, type GetState } from '../operations/undo-operations';

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

export function catalogStackId(name: string, version: string): string {
  return `catalog:${name}:${version}`;
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
  setCurrentUndoStackId(setState, catalogStackId(name, version));
}

export function openCatalogCreateDialog(setState: SetState): void {
  setCatalogCreateFormName(setState, '');
  setCatalogCreateFormType(setState, 'manual');
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: true });
}

export function closeCatalogCreateDialog(setState: SetState): void {
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
  setCatalogCreateFormName(setState, '');
  setCatalogCreateFormType(setState, 'manual');
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
    setCurrentUndoStackId(setState, catalogStackId(catalog.name, catalog.version));
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
    setCurrentUndoStackId(setState, catalogStackId(next.name, next.version));
  } else {
    setSelectedRef(setState, null);
    setCatalog(setState, null);
    setCurrentUndoStackId(setState, null);
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

export async function lockCatalog(setState: SetState, getState: GetState): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog || catalog.type !== 'manual' || catalog.locked) return;
  const updated: Catalog = { ...catalog, locked: true };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, catalog.name, catalog.version);
}

function catalogWithVersionBump(catalog: Catalog): Catalog {
  return catalog.locked
    ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
    : catalog;
}

export async function updateSourceUrl(
  setState: SetState,
  getState: GetState,
  sourceIndex: number,
  value: string,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog || sourceIndex < 0 || sourceIndex >= catalog.sources.length) return;
  const sources = catalog.sources.map((s, i) =>
    i === sourceIndex ? { ...s, url: value.trim() } : s,
  );
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = { ...base, sources };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}

export async function updateSourceTokenType(
  setState: SetState,
  getState: GetState,
  sourceIndex: number,
  value: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog || sourceIndex < 0 || sourceIndex >= catalog.sources.length) return;
  const sources = catalog.sources.map((s, i) =>
    i === sourceIndex ? { ...s, tokenType: value } : s,
  );
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = { ...base, sources };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}

export async function updateSourceType(
  setState: SetState,
  getState: GetState,
  sourceIndex: number,
  value: SourceType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog || sourceIndex < 0 || sourceIndex >= catalog.sources.length) return;
  const sources = catalog.sources.map((s, i) =>
    i === sourceIndex ? { ...s, type: value } : s,
  );
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = { ...base, sources };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}

export async function removeSource(
  setState: SetState,
  getState: GetState,
  sourceIndex: number,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog || sourceIndex < 0 || sourceIndex >= catalog.sources.length) return;
  const sources = catalog.sources.filter((_, i) => i !== sourceIndex);
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = { ...base, sources };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}

export async function addNewSource(setState: SetState, getState: GetState): Promise<void> {
  const state = getState().catalogs;
  const catalog = state.catalog;
  const url = state.newSourceUrl?.trim();
  if (!catalog || !url) return;
  const source: Source = {
    url,
    type: state.newSourceType,
    tokenType: state.newSourceTokenType,
  };
  const sources = [...catalog.sources, source];
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = { ...base, sources };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
  setCatalogNewSourceUrl(setState, '');
  setCatalogNewSourceTokenType(setState, 'theme');
  setCatalogNewSourceType(setState, 'default');
}

export async function updateTokenKey(
  setState: SetState,
  getState: GetState,
  oldKey: string,
  newKey: string,
  tokenType: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog) return;
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = {
    ...base,
    tokens: base.tokens.map((t) =>
      t.key === oldKey && t.type === tokenType ? { ...t, key: newKey } : t,
    ),
  };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}

export async function removeToken(
  setState: SetState,
  getState: GetState,
  key: TokenKey,
  tokenType: TokenType,
): Promise<void> {
  const catalog = getState().catalogs.catalog;
  if (!catalog) return;
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = {
    ...base,
    tokens: base.tokens.filter((t) => !(t.key === key && t.type === tokenType)),
  };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
}

export async function addNewToken(
  setState: SetState,
  getState: GetState,
  tokenType: TokenType,
  key?: string,
): Promise<void> {
  const state = getState().catalogs;
  const catalog = state.catalog;
  const tokenKey = (key ?? state.newTokenKey)?.trim();
  if (!catalog || !tokenKey) return;

  if (tokenType === 'semantic token') {
    const current = {
      types: catalog.semanticTokenTypes ?? [],
      modifiers: catalog.semanticTokenModifiers ?? [],
      languages: catalog.semanticTokenLanguages ?? [],
    };
    const merged = mergeSemanticSelectorInto(tokenKey, current);
    if (!merged) return;
    const base = catalogWithVersionBump(catalog);
    const updated: Catalog = {
      ...base,
      semanticTokenTypes: merged.types,
      semanticTokenModifiers: merged.modifiers,
      semanticTokenLanguages: merged.languages,
    };
    await saveCatalogOp(updated);
    await refreshRefsAndSelect(setState, updated.name, updated.version);
    setCatalogNewTokenKey(setState, '');
    return;
  }

  const newToken: Token = { key: tokenKey, type: tokenType };
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = {
    ...base,
    tokens: [...base.tokens, newToken],
  };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
  setCatalogNewTokenKey(setState, '');
}

export async function bulkAddTokens(setState: SetState, getState: GetState): Promise<void> {
  const state = getState().catalogs;
  const catalog = state.catalog;
  const text = state.bulkAddText?.trim();
  if (!catalog || !text) return;
  try {
    const result = parseThemeJson(text);
    const existingKeys = new Set(catalog.tokens.map((t) => `${t.type}::${t.key}`));
    const unique = result.tokens.filter((t) => !existingKeys.has(`${t.type}::${t.key}`));
    if (unique.length === 0) return;
    const base = catalogWithVersionBump(catalog);
    const updated: Catalog = { ...base, tokens: [...base.tokens, ...unique] };
    await saveCatalogOp(updated);
    await refreshRefsAndSelect(setState, updated.name, updated.version);
  } finally {
    setCatalogBulkAddDialogOpen(setState, false);
    setCatalogBulkAddText(setState, '');
  }
}

export function openBulkAddDialog(setState: SetState): void {
  setCatalogBulkAddDialogOpen(setState, true);
  setCatalogBulkAddText(setState, '');
}

export function closeBulkAddDialog(setState: SetState): void {
  setCatalogBulkAddDialogOpen(setState, false);
  setCatalogBulkAddText(setState, '');
}
