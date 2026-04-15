import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { BackgroundQueueUiState, initialBackgroundQueueUiState } from "./background-queue-ui-state";

interface BackgroundQueueUiStoreState {
    state: BackgroundQueueUiState;
    setState: (state: BackgroundQueueUiState) => void;
}

@singleton()
    export class BackgroundQueueUiStore {
    private store = createStore<BackgroundQueueUiStoreState>()(
        immer((set): BackgroundQueueUiStoreState => ({
            state: initialBackgroundQueueUiState,
            setState: (backgroundQueueState: BackgroundQueueUiState) => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state = backgroundQueueState;
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