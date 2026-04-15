import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { EyedropperUiState, initialEyedropperUiState } from "./eyedropper-ui-state";

interface EyedropperUiStoreState {
    state: EyedropperUiState;
    setState: (state: EyedropperUiState) => void;
}

@singleton()
export class EyedropperUiStore {
    private store = createStore<EyedropperUiStoreState>()(
        immer((set): EyedropperUiStoreState => ({
            state: initialEyedropperUiState,
            setState: (eyedropperUiState: EyedropperUiState) => set((state: EyedropperUiStoreState) => {
                state.state = eyedropperUiState;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getState(): EyedropperUiStoreState {
        return this.store.getState();
    }
}