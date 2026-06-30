import { describe, expect, it, vi } from 'vitest';
import { CloseCatalogCreateDialogController } from '../app/catalog/create-dialog/controllers/close-catalog-create-dialog-controller';
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

  it('creates and selects a catalog only when the dialog closes with OK', () => {
    const store = new CreateCatalogDialogStore();
    const catalogUiStore = { getStore: () => ({ state: { selectedRef: null } }) };
    const catalogsStore = {
      getStore: () => ({
        state: {
          catalogs: {
            'catalog-a': {
              '1.0.0': {
                isLoaded: true,
                catalog: {
                  name: 'catalog-a',
                  version: '1.0.0',
                  type: 'remote',
                  locked: false,
                  sources: [],
                  tokens: [],
                  semanticTokenTypes: [],
                  semanticTokenModifiers: [],
                  semanticTokenLanguages: [],
                },
              },
            },
          },
        },
      }),
    };
    const closeDialog = { execute: vi.fn() };
    const createCatalog = {
      execute: vi.fn(() => ({ name: 'catalog-a', version: '1.0.0' })),
    };
    const setSelectedCatalog = { execute: vi.fn() };
    const recordCatalogUndo = { execute: vi.fn() };
    const setCurrentUndoStackId = { executeForContext: vi.fn() };
    const controller = new CloseCatalogCreateDialogController(
      store,
      catalogUiStore as never,
      catalogsStore as never,
      { getStore: () => ({ state: { selectedRef: null } }) } as never,
      { getStore: () => ({ state: { selectedRef: null } }) } as never,
      closeDialog as never,
      createCatalog as never,
      setSelectedCatalog as never,
      recordCatalogUndo as never,
      setCurrentUndoStackId as never,
    );

    store.getStore().openCreateCatalogDialog();
    store.getStore().setCreateCatalogDialogData('  catalog-a  ', 'remote');

    controller.run('OK');

    expect(closeDialog.execute).toHaveBeenCalledWith('OK');
    expect(createCatalog.execute).toHaveBeenCalledWith({ name: 'catalog-a', type: 'remote' });
    expect(setSelectedCatalog.execute).toHaveBeenCalledWith({ name: 'catalog-a', version: '1.0.0' });

    vi.clearAllMocks();
    store.getStore().openCreateCatalogDialog();
    store.getStore().setCreateCatalogDialogData('catalog-b', 'manual');

    controller.run('Cancel');

    expect(closeDialog.execute).toHaveBeenCalledWith('CANCEL');
    expect(createCatalog.execute).not.toHaveBeenCalled();
    expect(setSelectedCatalog.execute).not.toHaveBeenCalled();
  });
});
