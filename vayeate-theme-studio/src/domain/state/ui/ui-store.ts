import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import type { MenuId, TabId } from '../../../model/app-ui';
import { UiState, initialUiState } from "./ui-state";

interface UiStoreState {
    state: UiState;
    setActiveTabId: (tabId: TabId) => void;
    closeMenus: () => void;
    openMenu: (menuId: MenuId) => void;
}

/**
 * Zustand store for shell tab and menu visibility state.
 */
@singleton()
export class UiStore {
    private store = createStore<UiStoreState>()(
        immer((set): UiStoreState => ({
            state: initialUiState,
            setActiveTabId: (tabId: TabId) => set((storeState: UiStoreState) => {
                storeState.state.activeTabId = tabId;
            }),
            closeMenus: () => set((storeState: UiStoreState) => {
                storeState.state.openMenu = null;
            }),
            openMenu: (menuId: MenuId) => set((storeState: UiStoreState) => {
                storeState.state.openMenu = menuId;
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
     * @returns Live shell UI store state and setters.
     */
    getStore(): UiStoreState {
        return this.store.getState();
    }
}
