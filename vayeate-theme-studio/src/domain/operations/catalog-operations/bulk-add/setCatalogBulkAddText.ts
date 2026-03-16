import type { SetState } from '../types';

export function setCatalogBulkAddText(setState: SetState, value: string): void {
  setState({ type: 'SET_CATALOG_BULK_ADD_TEXT', value });
}

