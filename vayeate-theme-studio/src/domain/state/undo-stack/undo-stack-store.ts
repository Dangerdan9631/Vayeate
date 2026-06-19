import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { initialUndoStackState, UndoMenuSnapshot, type UndoStackState } from "./undo-stack-state";
import type { TabId } from "../../../model/app-ui";
import type { UndoContext } from "../../../model/undo-history";

interface UndoStackStoreState {
    state: UndoStackState;
    setCurrentUndoStackId: (currentUndoStackId: string | null) => void;
    setUndoListVersion: (undoListVersion: number) => void;
    setUndoMenuSnapshot: (undoMenuSnapshot: UndoMenuSnapshot) => void;
    setCurrentBaselineLabel: (label: string) => void;
    setLastContextForTab: (tabId: TabId, context: UndoContext) => void;
}

/**
 * Zustand store for undo stack identity, menu snapshot, and per-tab context.
 */
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
            setLastContextForTab: (tabId: TabId, context: UndoContext) => set((state) => {
                state.state.lastContextByTab[tabId] = context;
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
     * Returns the current snapshot and mutation methods for domain operations.
     * @returns Live undo stack store state and setters.
     */
    getStore(): UndoStackStoreState {
        return this.store.getState();
    }
}
