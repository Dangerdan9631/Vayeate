import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { TabId, UiState, initialUiState } from "./ui-state";

interface UiStoreState {
    state: UiState;
    setActiveTabId: (tabId: TabId) => void;
    setAllMenusClosed: () => void;
    setMenuOpenState: (menuId: 'file' | 'edit' | 'history' | 'view', isOpen: boolean) => void;
}

@singleton()
export class UiStore {
    private store = createStore<UiStoreState>()(
        immer((set): UiStoreState => ({
            state: initialUiState,
            setActiveTabId: (tabId: TabId) => set((storeState: UiStoreState) => {
                storeState.state.activeTabId = tabId;
            }),
            setAllMenusClosed: () => set((storeState: UiStoreState) => {
                storeState.state.menuOpen = {
                    fileOpen: false,
                    editOpen: false,
                    historyOpen: false,
                    viewOpen: false,
                };
            }),
            setMenuOpenState: (menuId: 'file' | 'edit' | 'history' | 'view', isOpen: boolean) => set((storeState: UiStoreState) => {
                const menuKeyById = {
                    file: 'fileOpen',
                    edit: 'editOpen',
                    history: 'historyOpen',
                    view: 'viewOpen',
                } as const;
                const menuKey = menuKeyById[menuId];
                storeState.state.menuOpen[menuKey] = isOpen;
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