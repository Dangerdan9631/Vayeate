import { createStore } from "zustand/vanilla";
import { ActionQueueUiState, initialActionQueueUiState } from "./action-queue-ui-state";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";

interface ActionQueueUiStoreState {
    state: ActionQueueUiState;
    setState: (state: ActionQueueUiState) => void;
}

@singleton()
export class ActionQueueUiStore {
    private store = createStore<ActionQueueUiStoreState>()(
        immer((set): ActionQueueUiStoreState => ({
            state: initialActionQueueUiState,
            setState: (actionQueueUiState: ActionQueueUiState) => set((storeState: ActionQueueUiStoreState) => {
                storeState.state = actionQueueUiState;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getStore(): ActionQueueUiStoreState {
        return this.store.getState();
    }
}