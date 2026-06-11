import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import type { SourceType, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference } from '../../../model/schema/template-schemas';
import { emptyNewSource, initialCatalogUiState, type CatalogUiState, type LoadState } from './catalog-ui-state';

interface CatalogUiStoreState {
  state: CatalogUiState;
  setPageLoadState: (loadState: LoadState) => void;
  setCatalogLoadState: (loadState: LoadState) => void;
  selectCatalog: (ref: CatalogReference | null) => void;
  setTokensSearchText: (value: string) => void;
  setNewSourceData: (url?: string, tokenType?: TokenType, type?: SourceType) => void;
  clearNewSourceData: () => void;
  setNewTokenKey: (value: string) => void;
  setNewSemanticTokenSelectorText: (value: string) => void;
}

/**
 * Zustand store for catalog editor pane UI state and in-progress edits.
 */
@singleton()
export class CatalogUiStore {
  private store = createStore<CatalogUiStoreState>()(
    immer((set): CatalogUiStoreState => ({
      state: initialCatalogUiState,
      setPageLoadState: (loadState: LoadState) => set((storeState) => {
        storeState.state.pageLoadState = loadState;
      }),
      setCatalogLoadState: (loadState: LoadState) => set((storeState) => {
        storeState.state.catalogLoadState = loadState;
      }),
      selectCatalog: (ref: CatalogReference | null) => set((storeState) => {
        storeState.state.selectedRef = ref;
      }),
      setTokensSearchText: (value: string) => set((storeState) => {
        storeState.state.tokensSearchText = value;
      }),
      setNewSourceData: (url?: string, tokenType?: TokenType, type?: SourceType) => set((storeState) => {
        const newSource = storeState.state.newSource;
        if (!newSource) return;
        if (url !== undefined) newSource.url = url;
        if (tokenType !== undefined) newSource.tokenType = tokenType;
        if (type !== undefined) newSource.type = type;
      }),
      clearNewSourceData: () => set((storeState) => {
        storeState.state.newSource = emptyNewSource;
      }),
      setNewTokenKey: (value: string) => set((storeState) => {
        storeState.state.newTokenKey = value;
      }),
      setNewSemanticTokenSelectorText: (value: string) => set((storeState) => {
        storeState.state.newSemanticTokenSelectorText = value;
      }),
    }))
  );

  /**
   * Zustand store API for React subscriptions via viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current snapshot and mutation methods for domain operations.
   * @returns Live catalog pane UI store state and setters.
   */
  getStore(): CatalogUiStoreState {
    return this.store.getState();
  }
}
