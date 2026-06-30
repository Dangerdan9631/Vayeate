import { createStore } from "zustand/vanilla";
import { ActionQueueUiState, initialActionQueueUiState } from "./action-queue-ui-state";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";

interface ActionQueueUiStoreState {
    state: ActionQueueUiState;
    setQueueStatus: (queueLength: number, currentActionDescription: string) => void;
    completeQueueProcessing: () => void;
}

/**
 * Zustand store for UI action queue length and current action description.
 */
@singleton()
export class ActionQueueUiStore {
    private store = createStore<ActionQueueUiStoreState>()(
        immer((set): ActionQueueUiStoreState => ({
            state: initialActionQueueUiState,
            setQueueStatus: (queueLength: number, currentActionDescription: string) => set((storeState: ActionQueueUiStoreState) => {
                storeState.state.queueLength = queueLength;
                storeState.state.currentActionDescription = currentActionDescription;
            }),
            completeQueueProcessing: () => set((storeState: ActionQueueUiStoreState) => {
                storeState.state.queueLength = 0;
                storeState.state.currentActionDescription = undefined;
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
     * Returns the current snapshot and mutation methods for the action queue implementation.
     * @returns Live action queue UI store state and setters.
     */
    getStore(): ActionQueueUiStoreState {
        return this.store.getState();
    }
}
