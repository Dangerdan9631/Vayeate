import {
  setCatalogBulkAddDialogOpen,
  setCatalogBulkAddText,
  type SetState,
} from '../../../operations/catalog-operations';

export function closeBulkAddDialog(setState: SetState): void {
  setCatalogBulkAddDialogOpen(setState, false);
  setCatalogBulkAddText(setState, '');
}

