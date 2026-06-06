import { describe, expect, it } from 'vitest';
import { CloseCatalogCreateDialogOperation } from './operations/create-dialog/operations/close-catalog-create-dialog-operation';
import { OpenCatalogCreateDialogOperation } from './operations/create-dialog/operations/open-catalog-create-dialog-operation';
import { SetCatalogCreateDialogDataOperation } from './operations/create-dialog/operations/set-catalog-create-dialog-data-operation';
import { SetCatalogCreateDialogErrorOperation } from './operations/create-dialog/operations/set-catalog-create-dialog-error-operation';
import { CreateCatalogDialogStore } from './state/ui/create-catalog-dialog-store';

describe('catalog create dialog operations', () => {
  it('opens, updates, errors, and closes the dialog through the store operations', () => {
    const store = new CreateCatalogDialogStore();
    const openDialog = new OpenCatalogCreateDialogOperation(store);
    const setData = new SetCatalogCreateDialogDataOperation(store);
    const setError = new SetCatalogCreateDialogErrorOperation(store);
    const closeDialog = new CloseCatalogCreateDialogOperation(store);

    openDialog.execute();
    expect(store.getStore().state).toMatchObject({
      isOpen: true,
      name: '',
      type: 'manual',
      errorMessage: null,
    });

    setData.execute({ name: 'catalog-a', type: 'remote' });
    setError.execute('Invalid');
    expect(store.getStore().state).toMatchObject({
      isOpen: true,
      name: 'catalog-a',
      type: 'remote',
      errorMessage: 'Invalid',
    });

    closeDialog.execute('OK');
    expect(store.getStore().state).toMatchObject({
      isOpen: false,
      name: 'catalog-a',
      type: 'remote',
      errorMessage: 'Invalid',
    });

    openDialog.execute();
    closeDialog.execute('CANCEL');
    expect(store.getStore().state).toBeNull();
  });
});
