import { container } from 'tsyringe';
import { CatalogsStateSetter } from '../../state/catalog/catalogs-state-reducer';
import { CatalogsStateGetter } from '../../state/catalog/catalogs-state-reducer';
import type { SetCatalogsState } from '../../state/catalog/catalogs-state-reducer';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';

// Import all operation classes for wrapper functions
import { SetCatalogRefsOperation } from './catalog-list/set-catalog-refs-operation';
import { SetSelectedRefOperation } from './catalog-list/set-selected-ref-operation';
import { SetSelectedCatalogOperation } from './catalog-list/set-selected-catalog-operation';
import { SetCatalogCreateDialogDataOperation } from './create-dialog/set-catalog-create-dialog-data-operation';
import { GetCatalogCreateDialogDataOperation } from './create-dialog/get-catalog-create-dialog-data-operation';
import { OpenCatalogCreateDialogOperation } from './create-dialog/open-catalog-create-dialog-operation';
import { CloseCatalogCreateDialogOperation } from './create-dialog/close-catalog-create-dialog-operation';
import { LoadCatalogRefsOperation } from './catalog-list/load-catalog-refs-operation';
import { CreateCatalogOperation } from './catalog-list/create-catalog-operation';
import { RefreshCatalogRefsOperation } from './catalog-list/refresh-catalog-refs-operation';
import { DeleteCatalogOperation } from './catalog-list/delete-catalog-operation';
import { ListCatalogRefsOperation } from './catalog-list/list-catalog-refs-operation';
import { GetCatalogRefsOperation } from './catalog-list/get-catalog-refs-operation';
import { SetCatalogOperation } from './catalog-details/set-catalog-operation';
import { LoadCatalogOperation } from './catalog-details/load-catalog-operation';
import { LoadCatalogForDisplayOperation } from './catalog-details/load-catalog-for-display-operation';
import { SaveCatalogOperation } from './catalog-details/save-catalog-operation';
import { SyncCatalogOperation } from './catalog-details/sync-catalog-operation';
import { LoadCatalogSnapshotOperation } from './catalog-details/load-catalog-snapshot-operation';
import { LockCatalogOperation } from './catalog-details/lock-catalog-operation';
import { RevertCatalogOperation } from './catalog-details/revert-catalog-operation';
import { BumpCatalogVersionForEditOperation } from './catalog-details/bump-catalog-version-for-edit-operation';
import { LockHeadCatalogIfUnlockedOperation } from './catalog-details/lock-head-catalog-if-unlocked-operation';
import { SetCatalogBulkAddDialogOpenOperation } from './bulk-add/set-catalog-bulk-add-dialog-open-operation';
import { SetCatalogBulkAddTextOperation } from './bulk-add/set-catalog-bulk-add-text-operation';
import { SetCatalogNewSourceUrlOperation } from './sources/set-catalog-new-source-url-operation';
import { SetCatalogNewSourceTokenTypeOperation } from './sources/set-catalog-new-source-token-type-operation';
import { SetCatalogNewSourceTypeOperation } from './sources/set-catalog-new-source-type-operation';
import { AddSourceToCatalogOperation } from './sources/add-source-to-catalog-operation';
import { RemoveSourceAtIndexOperation } from './sources/remove-source-at-index-operation';
import { UpdateSourceUrlInCatalogOperation } from './sources/update-source-url-in-catalog-operation';
import { UpdateSourceTypeInCatalogOperation } from './sources/update-source-type-in-catalog-operation';
import { UpdateSourceTokenTypeInCatalogOperation } from './sources/update-source-token-type-in-catalog-operation';
import { SetCatalogTokensSearchTextOperation } from './tokens/set-catalog-tokens-search-text-operation';
import { SetCatalogNewTokenKeyOperation } from './tokens/set-catalog-new-token-key-operation';
import { DeduplicateBulkTokensOperation } from './tokens/deduplicate-bulk-tokens-operation';
import { AppendTokensToCatalogOperation } from './tokens/append-tokens-to-catalog-operation';
import { AddPlainTokenToCatalogOperation } from './tokens/add-plain-token-to-catalog-operation';
import { MergeSemanticSelectorsIntoCatalogOperation } from './tokens/merge-semantic-selectors-into-catalog-operation';
import { UpdateTokenKeyInCatalogOperation } from './tokens/update-token-key-in-catalog-operation';
import { RemoveTokenFromCatalogOperation } from './tokens/remove-token-from-catalog-operation';

export type { CatalogPaneState, CatalogUndoPush } from './types';
export type { CatalogCreateDialogData } from './create-dialog/get-catalog-create-dialog-data-operation';

// Re-export all classes
export {
  SetCatalogRefsOperation,
  SetSelectedRefOperation,
  SetSelectedCatalogOperation,
  SetCatalogCreateDialogDataOperation,
  GetCatalogCreateDialogDataOperation,
  OpenCatalogCreateDialogOperation,
  CloseCatalogCreateDialogOperation,
  LoadCatalogRefsOperation,
  CreateCatalogOperation,
  RefreshCatalogRefsOperation,
  DeleteCatalogOperation,
  ListCatalogRefsOperation,
  GetCatalogRefsOperation,
  SetCatalogOperation,
  LoadCatalogOperation,
  LoadCatalogForDisplayOperation,
  SaveCatalogOperation,
  SyncCatalogOperation,
  LoadCatalogSnapshotOperation,
  LockCatalogOperation,
  RevertCatalogOperation,
  BumpCatalogVersionForEditOperation,
  LockHeadCatalogIfUnlockedOperation,
  SetCatalogBulkAddDialogOpenOperation,
  SetCatalogBulkAddTextOperation,
  SetCatalogNewSourceUrlOperation,
  SetCatalogNewSourceTokenTypeOperation,
  SetCatalogNewSourceTypeOperation,
  AddSourceToCatalogOperation,
  RemoveSourceAtIndexOperation,
  UpdateSourceUrlInCatalogOperation,
  UpdateSourceTypeInCatalogOperation,
  UpdateSourceTokenTypeInCatalogOperation,
  SetCatalogTokensSearchTextOperation,
  SetCatalogNewTokenKeyOperation,
  DeduplicateBulkTokensOperation,
  AppendTokensToCatalogOperation,
  AddPlainTokenToCatalogOperation,
  MergeSemanticSelectorsIntoCatalogOperation,
  UpdateTokenKeyInCatalogOperation,
  RemoveTokenFromCatalogOperation,
};

// Re-export LockCatalogOperation with alias for backwards compatibility function wrapper
// This allows the class to be called like a function for compatibility
export const applyLockToCatalog = (catalog: any) =>
  new LockCatalogOperation().execute(catalog);

/** @deprecated Backward compatibility — use injected CatalogsStateSetter */
export type SetState = SetCatalogsState;

// Backward-compatible function wrappers for controller migration period
// These adapt the old function signatures to work with the new DI-based classes

export const setCatalogRefs = (_setCatalogsState: SetCatalogsState, refs: any) =>
  new SetCatalogRefsOperation(new CatalogsStateSetter(_setCatalogsState)).execute(refs);

export const setSelectedRef = (_setState: any, ref: any) =>
  new SetSelectedRefOperation(new CatalogsStateSetter(_setState)).execute(ref);

export const setCatalogCreateDialogData = (_setState: any, options: any) =>
  new SetCatalogCreateDialogDataOperation(new CatalogsStateSetter(_setState)).execute(options);

export const openCatalogCreateDialog = (_setState: any) =>
  new OpenCatalogCreateDialogOperation(new CatalogsStateSetter(_setState)).execute();

export const closeCatalogCreateDialog = (_setState: any) =>
  new CloseCatalogCreateDialogOperation(new CatalogsStateSetter(_setState)).execute();

export const createCatalog = (_setState: any, params: any) =>
  container.resolve(CreateCatalogOperation).execute(params);

export const refreshCatalogRefs = (_setStoreState: any) =>
  new RefreshCatalogRefsOperation(new CatalogsStateSetter(_setStoreState), container.resolve(CatalogGateway)).execute();

export const deleteCatalog = (name: any, version: any) =>
  container.resolve(DeleteCatalogOperation).execute(name, version);

export const listCatalogRefs = () => container.resolve(ListCatalogRefsOperation).execute();

export const getCatalogRefs = (_getCatalogsState: () => import('../../state/catalog/catalogs-state').CatalogsState) =>
  new GetCatalogRefsOperation(
    new CatalogsStateGetter(_getCatalogsState),
  ).execute();

export const setCatalog = (_setState: any, catalog: any) =>
  new SetCatalogOperation(new CatalogsStateSetter(_setState)).execute(catalog);

export const loadCatalog = (_setState: any, name: any, version: any) =>
  container.resolve(LoadCatalogOperation).execute(name, version);

export const loadCatalogForDisplay = (_setState: any, name: any, version: any) =>
  new LoadCatalogForDisplayOperation(new CatalogsStateSetter(_setState), container.resolve(CatalogGateway)).execute(
    name,
    version,
  );

export const saveCatalog = (catalog: any) => container.resolve(SaveCatalogOperation).execute(catalog);

export const syncCatalog = (catalog: any) => container.resolve(SyncCatalogOperation).execute(catalog);

export const loadCatalogSnapshot = (name: any, version: any) =>
  container.resolve(LoadCatalogSnapshotOperation).execute(name, version);

export const lockCatalog = (catalog: any) =>
  new LockCatalogOperation().execute(catalog);

export const revertCatalog = (snapshot: any, newVersion: any) =>
  new RevertCatalogOperation().execute(snapshot, newVersion);

export const bumpCatalogVersionForEdit = (catalog: any) =>
  new BumpCatalogVersionForEditOperation().execute(catalog);

export const lockHeadCatalogIfUnlocked = (head: any) =>
  new LockHeadCatalogIfUnlockedOperation().execute(head);

export const setCatalogBulkAddDialogOpen = (_setState: any, value: any) =>
  new SetCatalogBulkAddDialogOpenOperation(new CatalogsStateSetter(_setState)).execute(value);

export const setCatalogBulkAddText = (_setState: any, value: any) =>
  new SetCatalogBulkAddTextOperation(new CatalogsStateSetter(_setState)).execute(value);

export const setCatalogNewSourceUrl = (_setState: any, value: any) =>
  new SetCatalogNewSourceUrlOperation(new CatalogsStateSetter(_setState)).execute(value);

export const setCatalogNewSourceTokenType = (_setState: any, value: any) =>
  new SetCatalogNewSourceTokenTypeOperation(new CatalogsStateSetter(_setState)).execute(value);

export const setCatalogNewSourceType = (_setState: any, value: any) =>
  new SetCatalogNewSourceTypeOperation(new CatalogsStateSetter(_setState)).execute(value);

export const addSourceToCatalog = (catalog: any, source: any) =>
  new AddSourceToCatalogOperation().execute(catalog, source);

export const removeSourceAtIndex = (catalog: any, sourceIndex: any) =>
  new RemoveSourceAtIndexOperation().execute(catalog, sourceIndex);

export const updateSourceUrlInCatalog = (catalog: any, sourceIndex: any, url: any) =>
  new UpdateSourceUrlInCatalogOperation().execute(catalog, sourceIndex, url);

export const updateSourceTypeInCatalog = (catalog: any, sourceIndex: any, value: any) =>
  new UpdateSourceTypeInCatalogOperation().execute(catalog, sourceIndex, value);

export const updateSourceTokenTypeInCatalog = (catalog: any, sourceIndex: any, value: any) =>
  new UpdateSourceTokenTypeInCatalogOperation().execute(catalog, sourceIndex, value);

export const setCatalogTokensSearchText = (_setState: any, value: any) =>
  new SetCatalogTokensSearchTextOperation(new CatalogsStateSetter(_setState)).execute(value);

export const setCatalogNewTokenKey = (_setState: any, value: any) =>
  new SetCatalogNewTokenKeyOperation(new CatalogsStateSetter(_setState)).execute(value);

export const deduplicateBulkTokens = (catalog: any, incoming: any) =>
  new DeduplicateBulkTokensOperation().execute(catalog, incoming);

export const appendTokensToCatalog = (catalog: any, tokens: any) =>
  new AppendTokensToCatalogOperation().execute(catalog, tokens);

export const addPlainTokenToCatalog = (catalog: any, token: any) =>
  new AddPlainTokenToCatalogOperation().execute(catalog, token);

export const mergeSemanticSelectorsIntoCatalog = (catalog: any, tokenKey: any) =>
  new MergeSemanticSelectorsIntoCatalogOperation().execute(catalog, tokenKey);

export const updateTokenKeyInCatalog = (catalog: any, oldKey: any, newKey: any, tokenType: any) =>
  new UpdateTokenKeyInCatalogOperation().execute(catalog, oldKey, newKey, tokenType);

export const removeTokenFromCatalog = (catalog: any, key: any, tokenType: any) =>
  new RemoveTokenFromCatalogOperation().execute(catalog, key, tokenType);
