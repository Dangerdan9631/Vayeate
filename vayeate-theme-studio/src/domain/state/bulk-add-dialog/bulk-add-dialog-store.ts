import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { singleton } from 'tsyringe';
import { DialogResultOkCancel } from '../../../model/dialog-result';
import type { TokenType } from '../../../model/schema/primitives';
import { BulkAddDialogState, emptyBulkAddData } from './bulk-add-dialog-state';

interface BulkAddDialogStoreState {
  state: BulkAddDialogState | null;
  openBulkAddDialog: () => void;
  setBulkAddDialogData: (text?: string) => void;
  setBulkAddDialogMetrics: (
    errorMessage: string | null,
    counts: Record<TokenType, number> | null,
    newCount: number,
    duplicateCount: number
  ) => void;
  closeBulkAddDialog: (result: DialogResultOkCancel) => void;
}

@singleton()
export class BulkAddDialogStore {
  private store = createStore<BulkAddDialogStoreState>()(
    immer((set): BulkAddDialogStoreState => ({
      state: null,
      openBulkAddDialog: () => set((storeState) => {
        storeState.state = {
          ...emptyBulkAddData,
          isOpen: true,
        };
      }),
      setBulkAddDialogData: (text?: string) => set((storeState) => {
        if (!storeState.state) return;
        if (text !== undefined) storeState.state.text = text;
      }),
      setBulkAddDialogMetrics: (
        errorMessage: string | null,
        counts: Record<TokenType, number> | null,
        newCount: number,
        duplicateCount: number
      ) => set((storeState) => {
        if (!storeState.state) return;
        storeState.state.errorMessage = errorMessage;
        storeState.state.counts = counts;
        storeState.state.newCount = newCount;
        storeState.state.duplicateCount = duplicateCount;
      }),
      closeBulkAddDialog: (result: DialogResultOkCancel) => set((storeState) => {
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

  getStore(): BulkAddDialogStoreState {
    return this.store.getState();
  }
}
