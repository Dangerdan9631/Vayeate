import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import { DialogResultOkCancel } from '../../../model/dialog-result';
import { CreateTemplateDialogState, emptyCreateTemplateData } from './create-template-dialog-state';

interface CreateTemplateDialogStoreState {
  state: CreateTemplateDialogState | null;
  openCreateTemplateDialog: () => void;
  setIsCreating: (value: boolean) => void;
  setCreateTemplateDialogData: (name?: string) => void;
  closeCreateTemplateDialog: (result: DialogResultOkCancel) => void;
}

@singleton()
export class CreateTemplateDialogStore {
  private store = createStore<CreateTemplateDialogStoreState>()(
    immer((set): CreateTemplateDialogStoreState => ({
      state: null,
      openCreateTemplateDialog: () => set((storeState) => {
        storeState.state = {
          ...emptyCreateTemplateData,
          isOpen: true,
        };
      }),
      setIsCreating: (value: boolean) => set((storeState) => {
        if (!storeState.state) return;
        storeState.state.isCreating = value;
      }),
      setCreateTemplateDialogData: (name?: string) => set((storeState) => {
        if (!storeState.state) return;
        if (name !== undefined) storeState.state.name = name;
      }),
      closeCreateTemplateDialog: (result: DialogResultOkCancel) => set((storeState) => {
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

  get api() {
    return this.store;
  }

  getStore(): CreateTemplateDialogStoreState {
    return this.store.getState();
  }
}
