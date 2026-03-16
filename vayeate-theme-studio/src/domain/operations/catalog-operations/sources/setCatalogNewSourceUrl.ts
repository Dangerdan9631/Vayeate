import type { SetState } from '../types';

export function setCatalogNewSourceUrl(setState: SetState, value: string): void {
  setState({ type: 'SET_CATALOG_NEW_SOURCE_URL', value });
}

