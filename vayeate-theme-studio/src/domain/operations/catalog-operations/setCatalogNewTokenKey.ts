import type { SetState } from './types';

export function setCatalogNewTokenKey(setState: SetState, value: string): void {
  setState({ type: 'SET_CATALOG_NEW_TOKEN_KEY', value });
}
