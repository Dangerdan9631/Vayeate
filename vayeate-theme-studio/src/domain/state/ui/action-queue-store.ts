import { createStore } from "zustand/vanilla";
import { ActionQueueState, initialActionQueueState } from "./action-queue-state";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";

interface ActionQueueStoreState {
    state: ActionQueueState;
    setState: (state: ActionQueueState) => void;
}

@singleton()
export class ActionQueueStore {
    private store = createStore<ActionQueueStoreState>()(
        immer((set): ActionQueueStoreState => ({
            state: initialActionQueueState,
            setState: (actionQueueState: ActionQueueState) => set((state: ActionQueueStoreState) => {
                state.state = actionQueueState;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getState(): ActionQueueStoreState {
        return this.store.getState();
    }
}