import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import { DialogResultOkCancel } from '../../../model/dialog-result';
import { CatalogType } from '../../../model/schema/primitives';
import { CreateCatalogDialogState, emptyCreateCatalogData } from './create-catalog-dialog-state';

interface CreateCatalogDialogStoreState {
  state: CreateCatalogDialogState | null;
  openCreateCatalogDialog: () => void;
  setCreateCatalogDialogData: (name?: string, type?: CatalogType) => void;
  setCreateCatalogDialogError: (errorMessage: string | null) => void;
  closeCreateCatalogDialog: (result: DialogResultOkCancel) => void;
}

/**
 * Zustand store for create-catalog dialog visibility, draft fields, and errors.
 */
@singleton()
export class CreateCatalogDialogStore {
  private store = createStore<CreateCatalogDialogStoreState>()(
    immer((set): CreateCatalogDialogStoreState => ({
      state: null,
      openCreateCatalogDialog: () => set((storeState) => {
        storeState.state = {
          ...emptyCreateCatalogData,
          isOpen: true,
        };
      }),
      setCreateCatalogDialogData: (name?: string, type?: CatalogType) => set((storeState) => {
        if (!storeState.state) return;

        if (name !== undefined) storeState.state.name = name;
        if (type !== undefined) storeState.state.type = type;
      }),
      setCreateCatalogDialogError: (errorMessage: string | null) => set((storeState) => {
        if (!storeState.state) return;
        storeState.state.errorMessage = errorMessage;
      }),
      closeCreateCatalogDialog: (result: DialogResultOkCancel) => set((storeState) => {
        if (!storeState.state) return;
        switch (result) {
          case 'OK':
            storeState.state.isOpen = false;
            break;
          case 'CANCEL':
            storeState.state = null;
            break;
        }
      }),
    }))
  );

  /**
   * Zustand store API for React subscriptions via viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current snapshot and mutation methods for domain operations.
   * @returns Live create-catalog dialog store state and setters.
   */
  getStore(): CreateCatalogDialogStoreState {
    return this.store.getState();
  }
}
