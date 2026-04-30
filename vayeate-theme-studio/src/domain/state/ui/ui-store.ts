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

    get api() {
        return this.store;
    }

    getStore(): UiStoreState {
        return this.store.getState();
    }
}
