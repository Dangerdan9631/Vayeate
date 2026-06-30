import type { SourceType, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference } from '../../../model/schema/template-schemas';

/**
 * In-progress fields for adding a new remote source in the catalog details pane.
 */
export interface NewSourceState {
  url: string;
  tokenType: TokenType;
  type: SourceType;
}

/**
 * Load phase for catalog page or selected catalog content.
 */
export type LoadState = 'unloaded' | 'loading' | 'loaded';

/**
 * Catalog editor pane UI state including selection, token search, and new-source drafts.
 */
export interface CatalogUiState {
  pageLoadState: LoadState;
  catalogLoadState: LoadState;
  selectedRef: CatalogReference | null;
  tokensSearchText: string;
  newSource: NewSourceState;
  newTokenKey: string;
  newSemanticTokenSelectorText: string;
}

/**
 * Empty new-source draft used when clearing source form fields.
 */
export const emptyNewSource: NewSourceState = {
  url: '',
  tokenType: 'theme',
  type: 'default',
};

/**
 * Default catalog pane UI state before a catalog is selected or loaded.
 */
export const initialCatalogUiState: CatalogUiState = {
  pageLoadState: 'unloaded',
  catalogLoadState: 'unloaded',
  selectedRef: null,
  tokensSearchText: '',
  newSource: emptyNewSource,
  newTokenKey: '',
  newSemanticTokenSelectorText: '',
};
