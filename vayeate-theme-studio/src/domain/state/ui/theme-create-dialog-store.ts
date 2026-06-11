import { singleton } from 'tsyringe';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import { initialThemeCreateDialogState, type ThemeCreateDialogState } from './theme-create-dialog-state';

interface ThemeCreateDialogStoreState {
  state: ThemeCreateDialogState;
  setIsCreating: (value: boolean) => void;
  setOpen: (value: boolean) => void;
  setName: (value: string) => void;
}

/**
 * Zustand store for create-theme dialog visibility and draft name.
 */
@singleton()
export class ThemeCreateDialogStore {
  private store = createStore<ThemeCreateDialogStoreState>()(
    immer((set): ThemeCreateDialogStoreState => ({
      state: initialThemeCreateDialogState,
      setIsCreating: (value: boolean) => set((storeState) => {
        storeState.state.isCreating = value;
      }),
      setOpen: (value: boolean) => set((storeState) => {
        storeState.state.isOpen = value;
      }),
      setName: (value: string) => set((storeState) => {
        storeState.state.name = value;
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
   * @returns Live create-theme dialog store state and setters.
   */
  getStore(): ThemeCreateDialogStoreState {
    return this.store.getState();
  }
}
