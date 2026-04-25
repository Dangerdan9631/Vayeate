import { createStore } from "zustand/vanilla";
import { ActionQueueUiState, initialActionQueueUiState } from "./action-queue-ui-state";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";

interface ActionQueueUiStoreState {
    state: ActionQueueUiState;
    setQueueProcess: (queueLength: number) => void;
    finishQueueProcessing: () => void;
}

@singleton()
export class ActionQueueUiStore {
    private store = createStore<ActionQueueUiStoreState>()(
        immer((set): ActionQueueUiStoreState => ({
            state: initialActionQueueUiState,
            setQueueProcess: (queueLength: number) => set((storeState: ActionQueueUiStoreState) => {
                storeState.state.queueLength = queueLength;
            }),
            finishQueueProcessing: () => set((storeState: ActionQueueUiStoreState) => {
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