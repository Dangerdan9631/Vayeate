import type { Catalog, CatalogType } from '../model/schemas';
import {
  loadCatalogRefs,
  loadCatalogForDisplay,
  setSelectedRef,
  loadCatalog,
  setCatalog,
  refreshRefsAndSelect,
  saveCatalogAndRefresh,
  deleteCatalogVersion,
  syncCatalogAndSave,
  revertCatalogToVersion,
  restoreCatalogState,
  createCatalog as createCatalogOperation,
  type SetState,
  type CatalogUndoPush,
} from '../operations/catalog-operations';
import { createLogger } from '../utils/logger';

const log = createLogger('CatalogController');

export interface CreateCatalogParams {
  name: string;
  type: CatalogType;
}

export function createCatalogWithParams(params: CreateCatalogParams): Catalog {
  log.debug('createCatalogWithParams', params.name, params.type);
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

export async function handleCatalogPageOnLoad(setState: SetState): Promise<void> {
  log.debug('handleCatalogPageOnLoad');
  await loadCatalogRefs(setState);
}

export async function handleCatalogLoadForDisplay(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await loadCatalogForDisplay(setState, name, version);
}

export async function handleCatalogListOnSelect(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  log.debug('handleCatalogListOnSelect', name, `v${version}`);
  const ref = { name, version };
  setSelectedRef(setState, ref);
  await loadCatalog(setState, name, version);
}

export function handleCreateDialogOnOpen(setState: SetState): void {
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: true });
}

export function handleCreateDialogOnClose(setState: SetState): void {
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
}

export async function handleCreateFormOnSubmit(
  setState: SetState,
  params: { name: string; type: 'manual' | 'remote' },
): Promise<void> {
  log.debug('handleCreateFormOnSubmit', params);
  setState({ type: 'SET_IS_CREATING', value: true });
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
  try {
    const catalog = await createCatalogOperation(setState, params);
    await refreshRefsAndSelect(setState, catalog.name, catalog.version);
    setCatalog(setState, catalog);
    setSelectedRef(setState, { name: catalog.name, version: catalog.version });
  } finally {
    setState({ type: 'SET_IS_CREATING', value: false });
  }
}

export async function handleSaveButtonOnClick(
  setState: SetState,
  catalog: Catalog,
): Promise<void> {
  log.debug('handleSaveButtonOnClick', catalog.name, catalog.version);
  await saveCatalogAndRefresh(catalog, setState);
}

export async function handleVersionDeleteButtonOnClick(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteCatalogVersion(setState, name, version);
}

export async function handleSyncButtonOnClick(
  setState: SetState,
  catalog: Catalog,
  catalogUndoPush: CatalogUndoPush | null,
): Promise<void> {
  await syncCatalogAndSave(setState, catalog, catalogUndoPush);
}

export async function handleRevertButtonOnClick(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  await revertCatalogToVersion(setState, name, version);
}

export async function handleUndoPanelRestoreCatalog(
  setState: SetState,
  catalog: Catalog | null,
  deleteVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  await restoreCatalogState(setState, catalog, deleteVersionOnRestore);
}
