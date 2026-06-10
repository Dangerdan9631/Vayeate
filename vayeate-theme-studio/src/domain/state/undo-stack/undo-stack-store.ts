import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { initialUndoStackState, UndoMenuSnapshot, type UndoStackState } from "./undo-stack-state";

interface UndoStackStoreState {
    state: UndoStackState;
    setCurrentUndoStackId: (currentUndoStackId: string | null) => void;
    setUndoListVersion: (undoListVersion: number) => void;
    setUndoMenuSnapshot: (undoMenuSnapshot: UndoMenuSnapshot) => void;
    setCurrentBaselineLabel: (label: string) => void;
}

@singleton()
export class UndoStackStore {
    private store = createStore<UndoStackStoreState>()(
        immer((set): UndoStackStoreState => ({
            state: initialUndoStackState,
            setCurrentUndoStackId: (currentUndoStackId: string | null) => set((state) => {
                state.state.currentUndoStackId = currentUndoStackId;
            }),
            setUndoListVersion: (undoListVersion: number) => set((state) => {
                state.state.undoListVersion = undoListVersion;
            }),
            setUndoMenuSnapshot: (undoMenuSnapshot: UndoMenuSnapshot) => set((state) => {
                state.state.undoMenu = undoMenuSnapshot;
            }),
            setCurrentBaselineLabel: (label: string) => set((state) => {
                state.state.currentBaselineLabel = label;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getStore(): UndoStackStoreState {
        return this.store.getState();
    }
}
