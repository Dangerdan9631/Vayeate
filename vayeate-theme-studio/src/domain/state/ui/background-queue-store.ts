import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { BackgroundQueueState, initialBackgroundQueueState } from "./background-queue-state";

interface BackgroundQueueStoreState {
    state: BackgroundQueueState;
    setState: (state: BackgroundQueueState) => void;
}

@singleton()
    export class BackgroundQueueStore {
    private store = createStore<BackgroundQueueStoreState>()(
        immer((set): BackgroundQueueStoreState => ({
            state: initialBackgroundQueueState,
            setState: (backgroundQueueState: BackgroundQueueState) => set((state: BackgroundQueueStoreState) => {
                state.state = backgroundQueueState;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getState(): BackgroundQueueStoreState {
        return this.store.getState();
    }
}