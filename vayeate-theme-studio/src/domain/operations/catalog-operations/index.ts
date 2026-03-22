import { container } from 'tsyringe';
import { AppStateSetter } from '../../state/app-state-setter';
import { StoreStateSetter } from '../../state/store-state-setter';
import { AppStateGetter } from '../../state/app-state-getter';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';

// Import all operation classes for wrapper functions
import { SetCatalogRefs } from './catalog-list/setCatalogRefs';
import { SetSelectedRef } from './catalog-list/setSelectedRef';
import { SetSelectedCatalog } from './catalog-list/setSelectedCatalog';
import { SetCatalogCreateDialogData } from './create-dialog/setCatalogCreateDialogData';
import { GetCatalogCreateDialogData } from './create-dialog/getCatalogCreateDialogData';
import { OpenCatalogCreateDialog } from './create-dialog/openCatalogCreateDialog';
import { CloseCatalogCreateDialog } from './create-dialog/closeCatalogCreateDialog';
import { LoadCatalogRefs } from './catalog-list/loadCatalogRefs';
import { CreateCatalog } from './catalog-list/createCatalog';
import { RefreshCatalogRefs } from './catalog-list/refreshCatalogRefs';
import { DeleteCatalog } from './catalog-list/deleteCatalog';
import { ListCatalogRefs } from './catalog-list/listCatalogRefs';
import { GetCatalogRefs } from './catalog-list/getCatalogRefs';
import { SetCatalog } from './catalog-details/setCatalog';
import { LoadCatalog } from './catalog-details/loadCatalog';
import { LoadCatalogForDisplay } from './catalog-details/loadCatalogForDisplay';
import { SaveCatalog } from './catalog-details/saveCatalog';
import { SyncCatalog } from './catalog-details/syncCatalog';
import { LoadCatalogSnapshot } from './catalog-details/loadCatalogSnapshot';
import { LockCatalog } from './catalog-details/lock-catalog';
import { RevertCatalog } from './catalog-details/revert-catalog';
import { BumpCatalogVersionForEdit } from './catalog-details/bump-catalog-version-for-edit';
import { LockHeadCatalogIfUnlocked } from './catalog-details/lock-head-catalog-if-unlocked';
import { SetCatalogBulkAddDialogOpen } from './bulk-add/setCatalogBulkAddDialogOpen';
import { SetCatalogBulkAddText } from './bulk-add/setCatalogBulkAddText';
import { SetCatalogNewSourceUrl } from './sources/setCatalogNewSourceUrl';
import { SetCatalogNewSourceTokenType } from './sources/setCatalogNewSourceTokenType';
import { SetCatalogNewSourceType } from './sources/setCatalogNewSourceType';
import { AddSourceToCatalog } from './sources/add-source-to-catalog';
import { RemoveSourceAtIndex } from './sources/remove-source-at-index';
import { UpdateSourceUrlInCatalog } from './sources/update-source-url-in-catalog';
import { UpdateSourceTypeInCatalog } from './sources/update-source-type-in-catalog';
import { UpdateSourceTokenTypeInCatalog } from './sources/update-source-token-type-in-catalog';
import { SetCatalogTokensSearchText } from './tokens/setCatalogTokensSearchText';
import { SetCatalogNewTokenKey } from './tokens/setCatalogNewTokenKey';
import { DeduplicateBulkTokens } from './tokens/deduplicate-bulk-tokens';
import { AppendTokensToCatalog } from './tokens/append-tokens-to-catalog';
import { AddPlainTokenToCatalog } from './tokens/add-plain-token-to-catalog';
import { MergeSemanticSelectorsIntoCatalog } from './tokens/merge-semantic-selectors-into-catalog';
import { UpdateTokenKeyInCatalog } from './tokens/update-token-key-in-catalog';
import { RemoveTokenFromCatalog } from './tokens/remove-token-from-catalog';

export type { CatalogPaneState, CatalogUndoPush } from './types';
export type { CatalogCreateDialogData } from './create-dialog/getCatalogCreateDialogData';

// Re-export all classes
export {
  SetCatalogRefs,
  SetSelectedRef,
  SetSelectedCatalog,
  SetCatalogCreateDialogData,
  GetCatalogCreateDialogData,
  OpenCatalogCreateDialog,
  CloseCatalogCreateDialog,
  LoadCatalogRefs,
  CreateCatalog,
  RefreshCatalogRefs,
  DeleteCatalog,
  ListCatalogRefs,
  GetCatalogRefs,
  SetCatalog,
  LoadCatalog,
  LoadCatalogForDisplay,
  SaveCatalog,
  SyncCatalog,
  LoadCatalogSnapshot,
  LockCatalog,
  RevertCatalog,
  BumpCatalogVersionForEdit,
  LockHeadCatalogIfUnlocked,
  SetCatalogBulkAddDialogOpen,
  SetCatalogBulkAddText,
  SetCatalogNewSourceUrl,
  SetCatalogNewSourceTokenType,
  SetCatalogNewSourceType,
  AddSourceToCatalog,
  RemoveSourceAtIndex,
  UpdateSourceUrlInCatalog,
  UpdateSourceTypeInCatalog,
  UpdateSourceTokenTypeInCatalog,
  SetCatalogTokensSearchText,
  SetCatalogNewTokenKey,
  DeduplicateBulkTokens,
  AppendTokensToCatalog,
  AddPlainTokenToCatalog,
  MergeSemanticSelectorsIntoCatalog,
  UpdateTokenKeyInCatalog,
  RemoveTokenFromCatalog,
};

// Re-export LockCatalog with alias for backwards compatibility function wrapper
// This allows the class to be called like a function for compatibility
export const applyLockToCatalog = (catalog: any) =>
  new LockCatalog().execute(catalog);

/** @deprecated Backward compatibility type - use injected AppStateSetter instead */
export type SetState = (update: import('../../state/app-state').AppStateUpdate) => void;

// Backward-compatible function wrappers for controller migration period
// These adapt the old function signatures to work with the new DI-based classes

export const setCatalogRefs = (_setStoreState: any, refs: any) =>
  new SetCatalogRefs(new StoreStateSetter(_setStoreState)).execute(refs);

export const setSelectedRef = (_setState: any, ref: any) =>
  new SetSelectedRef(new AppStateSetter(_setState)).execute(ref);

export const setCatalogCreateDialogData = (_setState: any, options: any) =>
  new SetCatalogCreateDialogData(new AppStateSetter(_setState)).execute(options);

export const openCatalogCreateDialog = (_setState: any) =>
  new OpenCatalogCreateDialog(new AppStateSetter(_setState)).execute();

export const closeCatalogCreateDialog = (_setState: any) =>
  new CloseCatalogCreateDialog(new AppStateSetter(_setState)).execute();

export const createCatalog = (_setState: any, params: any) =>
  container.resolve(CreateCatalog).execute(params);

export const refreshCatalogRefs = (_setStoreState: any) =>
  new RefreshCatalogRefs(new StoreStateSetter(_setStoreState), container.resolve(CatalogGateway)).execute();

export const deleteCatalog = (name: any, version: any) =>
  container.resolve(DeleteCatalog).execute(name, version);

export const listCatalogRefs = () => container.resolve(ListCatalogRefs).execute();

export const getCatalogRefs = (_getState: any) =>
  new GetCatalogRefs(new AppStateGetter(_getState)).execute();

export const setCatalog = (_setState: any, catalog: any) =>
  new SetCatalog(new AppStateSetter(_setState)).execute(catalog);

export const loadCatalog = (_setState: any, name: any, version: any) =>
  container.resolve(LoadCatalog).execute(name, version);

export const loadCatalogForDisplay = (_setState: any, name: any, version: any) =>
  new LoadCatalogForDisplay(new AppStateSetter(_setState), container.resolve(CatalogGateway)).execute(
    name,
    version,
  );

export const saveCatalog = (catalog: any) => container.resolve(SaveCatalog).execute(catalog);

export const syncCatalog = (catalog: any) => container.resolve(SyncCatalog).execute(catalog);

export const loadCatalogSnapshot = (name: any, version: any) =>
  container.resolve(LoadCatalogSnapshot).execute(name, version);

export const lockCatalog = (catalog: any) =>
  new LockCatalog().execute(catalog);

export const revertCatalog = (snapshot: any, newVersion: any) =>
  new RevertCatalog().execute(snapshot, newVersion);

export const bumpCatalogVersionForEdit = (catalog: any) =>
  new BumpCatalogVersionForEdit().execute(catalog);

export const lockHeadCatalogIfUnlocked = (head: any) =>
  new LockHeadCatalogIfUnlocked().execute(head);

export const setCatalogBulkAddDialogOpen = (_setState: any, value: any) =>
  new SetCatalogBulkAddDialogOpen(new AppStateSetter(_setState)).execute(value);

export const setCatalogBulkAddText = (_setState: any, value: any) =>
  new SetCatalogBulkAddText(new AppStateSetter(_setState)).execute(value);

export const setCatalogNewSourceUrl = (_setState: any, value: any) =>
  new SetCatalogNewSourceUrl(new AppStateSetter(_setState)).execute(value);

export const setCatalogNewSourceTokenType = (_setState: any, value: any) =>
  new SetCatalogNewSourceTokenType(new AppStateSetter(_setState)).execute(value);

export const setCatalogNewSourceType = (_setState: any, value: any) =>
  new SetCatalogNewSourceType(new AppStateSetter(_setState)).execute(value);

export const addSourceToCatalog = (catalog: any, source: any) =>
  new AddSourceToCatalog().execute(catalog, source);

export const removeSourceAtIndex = (catalog: any, sourceIndex: any) =>
  new RemoveSourceAtIndex().execute(catalog, sourceIndex);

export const updateSourceUrlInCatalog = (catalog: any, sourceIndex: any, url: any) =>
  new UpdateSourceUrlInCatalog().execute(catalog, sourceIndex, url);

export const updateSourceTypeInCatalog = (catalog: any, sourceIndex: any, value: any) =>
  new UpdateSourceTypeInCatalog().execute(catalog, sourceIndex, value);

export const updateSourceTokenTypeInCatalog = (catalog: any, sourceIndex: any, value: any) =>
  new UpdateSourceTokenTypeInCatalog().execute(catalog, sourceIndex, value);

export const setCatalogTokensSearchText = (_setState: any, value: any) =>
  new SetCatalogTokensSearchText(new AppStateSetter(_setState)).execute(value);

export const setCatalogNewTokenKey = (_setState: any, value: any) =>
  new SetCatalogNewTokenKey(new AppStateSetter(_setState)).execute(value);

export const deduplicateBulkTokens = (catalog: any, incoming: any) =>
  new DeduplicateBulkTokens().execute(catalog, incoming);

export const appendTokensToCatalog = (catalog: any, tokens: any) =>
  new AppendTokensToCatalog().execute(catalog, tokens);

export const addPlainTokenToCatalog = (catalog: any, token: any) =>
  new AddPlainTokenToCatalog().execute(catalog, token);

export const mergeSemanticSelectorsIntoCatalog = (catalog: any, tokenKey: any) =>
  new MergeSemanticSelectorsIntoCatalog().execute(catalog, tokenKey);

export const updateTokenKeyInCatalog = (catalog: any, oldKey: any, newKey: any, tokenType: any) =>
  new UpdateTokenKeyInCatalog().execute(catalog, oldKey, newKey, tokenType);

export const removeTokenFromCatalog = (catalog: any, key: any, tokenType: any) =>
  new RemoveTokenFromCatalog().execute(catalog, key, tokenType);
