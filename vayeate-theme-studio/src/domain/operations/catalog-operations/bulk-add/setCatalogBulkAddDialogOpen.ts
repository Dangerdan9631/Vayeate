import type { SetState } from '../types';

export function setCatalogBulkAddDialogOpen(setState: SetState, value: boolean): void {
  setState({ type: 'SET_CATALOG_BULK_ADD_DIALOG_OPEN', value });
}

