import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { BackgroundQueueUiState, initialBackgroundQueueUiState } from "./background-queue-ui-state";

interface BackgroundQueueUiStoreState {
    state: BackgroundQueueUiState;
    updateMainQueueStatus: (description: string, queueLength: number) => void;
    completeMainQueueProcessing: () => void;
    updateWorkerQueueStatus: (descriptions: string[], queueLength: number) => void;
    completeWorkerQueueProcessing: () => void;
}

@singleton()
export class BackgroundQueueUiStore {
    private store = createStore<BackgroundQueueUiStoreState>()(
        immer((set): BackgroundQueueUiStoreState => ({
            state: initialBackgroundQueueUiState,
            updateMainQueueStatus: (description: string, queueLength: number) => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.mainQueueDescription = description;
                storeState.state.mainQueueLength = queueLength;
            }),
            completeMainQueueProcessing: () => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.mainQueueDescription = undefined;
                storeState.state.mainQueueLength = 0;
            }),
            updateWorkerQueueStatus: (descriptions: string[], queueLength: number) => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.workerTaskDescriptions = descriptions;
                storeState.state.workerQueueLength = queueLength;
            }),
            completeWorkerQueueProcessing: () => set((storeState: BackgroundQueueUiStoreState) => {
                storeState.state.workerTaskDescriptions = [];
                storeState.state.workerQueueLength = 0;
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
