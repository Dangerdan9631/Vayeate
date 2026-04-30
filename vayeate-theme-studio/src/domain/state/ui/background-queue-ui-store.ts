import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { BackgroundQueueUiState, initialBackgroundQueueUiState } from "./background-queue-ui-state";

interface BackgroundQueueUiStoreState {
    state: BackgroundQueueUiState;
    updateQueueStatus: (description: string, queueLength: number) => void;
    completeQueueProcessing: () => void;
}

@singleton()
export class BackgroundQueueUiStore {
    private store = createStore<BackgroundQueueUiStoreState>()(
        immer((set): BackgroundQueueUiStoreState => ({
            state: initialBackgroundQueueUiState,
            updateQueueStatus: (description: string, queueLength: number) => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.description = description;
                storeState.state.queueLength = queueLength;
            }),
            completeQueueProcessing: () => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.description = undefined;
                storeState.state.queueLength = 0;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getStore(): BackgroundQueueUiStoreState {
        return this.store.getState();
    }
}
