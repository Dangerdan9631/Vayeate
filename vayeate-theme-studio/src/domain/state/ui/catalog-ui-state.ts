import type { SourceType, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference } from '../../../model/schema/template-schemas';

export interface NewSourceState {
  url: string;
  tokenType: TokenType;
  type: SourceType;
}

export type LoadState = 'unloaded' | 'loading' | 'loaded';

export interface CatalogUiState {
  pageLoadState: LoadState;
  catalogLoadState: LoadState;
  selectedRef: CatalogReference | null;
  tokensSearchText: string;
  newSource: NewSourceState;
  newTokenKey: string;
  newSemanticTokenSelectorText: string;
}

export const emptyNewSource: NewSourceState = {
  url: '',
  tokenType: 'theme',
  type: 'default',
};

export const initialCatalogUiState: CatalogUiState = {
  pageLoadState: 'unloaded',
  catalogLoadState: 'unloaded',
  selectedRef: null,
  tokensSearchText: '',
  newSource: emptyNewSource,
  newTokenKey: '',
  newSemanticTokenSelectorText: '',
};
