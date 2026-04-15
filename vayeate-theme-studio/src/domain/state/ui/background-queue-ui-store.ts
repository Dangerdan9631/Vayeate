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
            setState: (backgroundQueueState: BackgroundQueueUiState) => set((state: BackgroundQueueUiStoreState) => {
                state.state = backgroundQueueState;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getState(): BackgroundQueueUiStoreState {
        return this.store.getState();
    }
}