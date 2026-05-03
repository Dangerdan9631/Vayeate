import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { BackgroundQueueUiState, initialBackgroundQueueUiState } from "./background-queue-ui-state";
import { BackgroundQueueType } from "../../../app/core/background-queue/background-queue-type";

interface BackgroundQueueUiStoreState {
    state: BackgroundQueueUiState;
    updateQueueStatus: (queueType: BackgroundQueueType, descriptions: string[], queueLength: number) => void;
    completeQueueProcessing: (queueType: BackgroundQueueType) => void;
}

@singleton()
export class BackgroundQueueUiStore {
    private store = createStore<BackgroundQueueUiStoreState>()(
        immer((set): BackgroundQueueUiStoreState => ({
            state: initialBackgroundQueueUiState,
            updateQueueStatus: (queueType: BackgroundQueueType, descriptions: string[], queueLength: number) => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.queues[queueType].queueDescriptions = descriptions;
                storeState.state.queues[queueType].queueLength = queueLength;
            }),
            completeQueueProcessing: (queueType: BackgroundQueueType) => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.queues[queueType].queueDescriptions = [];
                storeState.state.queues[queueType].queueLength = 0;
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
