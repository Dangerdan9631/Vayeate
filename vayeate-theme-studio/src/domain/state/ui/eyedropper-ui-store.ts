import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { EyedropperSnapshotPayload, EyedropperUiState, initialEyedropperUiState } from "./eyedropper-ui-state";
import { AppAction } from "../../../app/core/action-queue/app-action";
import { HexColor } from "../../../model/schema/primitives";

interface EyedropperUiStoreState {
    state: EyedropperUiState;
    openEyedropper: (callback: AppAction) => void;
    closeEyedropper: (result: HexColor | null) => void;
    updateEyedropperSnapshot: (snapshot: EyedropperSnapshotPayload) => void;
    setEyedropperErrorMessage: (message: string | null) => void;
    setState: (state: EyedropperUiState) => void;
}

@singleton()
export class EyedropperUiStore {
    private store = createStore<EyedropperUiStoreState>()(
        immer((set): EyedropperUiStoreState => ({
            state: initialEyedropperUiState,
            openEyedropper: (callbackAction: AppAction) => set((storeState: EyedropperUiStoreState) => {
                storeState.state = {
                    ...initialEyedropperUiState,
                    isOpen: true,
                    callbackAction: callbackAction
                };
            }),
            closeEyedropper: (result: HexColor | null) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.isOpen = false;
                storeState.state.result = result;
            }),
            updateEyedropperSnapshot: (snapshot: EyedropperSnapshotPayload) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.snapshot = snapshot;
            }),
            setEyedropperErrorMessage: (message: string | null) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.errorMessage = message;
            }),
            setState: (eyedropperUiState: EyedropperUiState) => set((storeState: EyedropperUiStoreState) => {
                storeState.state = eyedropperUiState;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getStore(): EyedropperUiStoreState {
        return this.store.getState();
    }
}