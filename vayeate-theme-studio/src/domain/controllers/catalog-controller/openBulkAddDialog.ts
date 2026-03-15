import {
  setCatalogBulkAddDialogOpen,
  setCatalogBulkAddText,
  type SetState,
} from '../../operations/catalog-operations';

export function openBulkAddDialog(setState: SetState): void {
  setCatalogBulkAddDialogOpen(setState, true);
  setCatalogBulkAddText(setState, '');
}
