import type { SourceType, TokenType } from '../../../model/schema/primitives';
import type { CatalogReference } from '../../../model/schema/template-schemas';

export interface NewSourceState {
  url: string;
  tokenType: TokenType;
  type: SourceType;
}

export interface CatalogUiState {
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
  selectedRef: null,
  tokensSearchText: '',
  newSource: emptyNewSource,
  newTokenKey: '',
  newSemanticTokenSelectorText: '',
};
