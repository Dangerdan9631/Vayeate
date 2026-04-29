import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { initialWindowState, type WindowState } from "./window-state";
import { Point, Size } from "../../../model/point";

interface WindowStoreState {
    state: WindowState;
    setWindowMinimized: (isMinimized: boolean) => void;
    setWindowMaximized: (isMaximized: boolean) => void;
    setWindowSize: (size: Size) => void;
    setWindowPosition: (position: Point) => void;
    setViewportSize: (size: Size) => void;
}

@singleton()
export class WindowStore {
    private store = createStore<WindowStoreState>()(
        immer((set): WindowStoreState => ({
            state: initialWindowState,
            setWindowMinimized: (isMinimized: boolean) => set((storeState: WindowStoreState) => {
                storeState.state.isMinimized = isMinimized;
            }),
            setWindowMaximized: (isMaximized: boolean) => set((storeState: WindowStoreState) => {
                storeState.state.isMaximized = isMaximized;
            }),
            setWindowSize: (size: Size) => set((storeState: WindowStoreState) => {
                storeState.state.bounds.width = size.width;
                storeState.state.bounds.height = size.height;
            }),
            setWindowPosition: (position: Point) => set((storeState: WindowStoreState) => {
                storeState.state.bounds.x = position.x;
                storeState.state.bounds.y = position.y;
            }),
            setViewportSize: (size: Size) => set((storeState: WindowStoreState) => {
                storeState.state.viewport = size;
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getStore(): WindowStoreState {
        return this.store.getState();
    }
}