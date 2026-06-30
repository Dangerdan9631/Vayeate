import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { BackgroundQueueUiState, initialBackgroundQueueUiState } from "./background-queue-ui-state";
import type { BackgroundQueueKey } from "../../../model/background-queue";

interface BackgroundQueueUiStoreState {
    state: BackgroundQueueUiState;
    updateQueueStatus: (queueType: BackgroundQueueKey, descriptions: string[], queueLength: number) => void;
    completeQueueProcessing: (queueType: BackgroundQueueKey) => void;
}

/**
 * Zustand store for background queue lengths and pending action descriptions.
 */
@singleton()
export class BackgroundQueueUiStore {
    private store = createStore<BackgroundQueueUiStoreState>()(
        immer((set): BackgroundQueueUiStoreState => ({
            state: initialBackgroundQueueUiState,
            updateQueueStatus: (queueType: BackgroundQueueKey, descriptions: string[], queueLength: number) => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.queues[queueType].queueDescriptions = descriptions;
                storeState.state.queues[queueType].queueLength = queueLength;
            }),
            completeQueueProcessing: (queueType: BackgroundQueueKey) => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.queues[queueType].queueDescriptions = [];
                storeState.state.queues[queueType].queueLength = 0;
            }),
        }))
    );

    /**
     * Zustand store API for React subscriptions via viewmodels.
     */
    get api() {
        return this.store;
    }

    /**
     * Returns the current snapshot and mutation methods for the background queue implementation.
     * @returns Live background queue UI store state and setters.
     */
    getStore(): BackgroundQueueUiStoreState {
        return this.store.getState();
    }
}
