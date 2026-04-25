import { createStore } from "zustand/vanilla";
import { ActionQueueUiState, initialActionQueueUiState } from "./action-queue-ui-state";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";

interface ActionQueueUiStoreState {
    state: ActionQueueUiState;
    setQueueStatus: (queueLength: number) => void;
    completeQueueProcessing: () => void;
}

@singleton()
export class ActionQueueUiStore {
    private store = createStore<ActionQueueUiStoreState>()(
        immer((set): ActionQueueUiStoreState => ({
            state: initialActionQueueUiState,
            setQueueStatus: (queueLength: number) => set((storeState: ActionQueueUiStoreState) => {
                storeState.state.queueLength = queueLength;
            }),
            completeQueueProcessing: () => set((storeState: ActionQueueUiStoreState) => {
                storeState.state.queueLength = 0;
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