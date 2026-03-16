import type { SetState } from '../types';

export function setCatalogTokensSearchText(setState: SetState, value: string): void {
  setState({ type: 'SET_CATALOG_TOKENS_SEARCH_TEXT', value });
}

