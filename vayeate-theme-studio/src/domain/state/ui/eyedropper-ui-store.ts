import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { EyedropperSnapshotPayload, EyedropperUiState, initialEyedropperUiState } from "./eyedropper-ui-state";
import { AppAction } from "../../../app/core/action-queue/app-action";
import { HexColor } from "../../../model/schema/primitives";
import { Point, Size } from "../../../model/point";

function closeSnapshotBitmaps(snapshot: EyedropperSnapshotPayload | null): void {
    if (!snapshot) return;
    for (const d of snapshot.displays) {
        d.bmp.close();
    }
}

interface EyedropperUiStoreState {
    state: EyedropperUiState;
    openEyedropper: (callback: AppAction) => void;
    closeEyedropper: () => void;
    updateEyedropperSnapshot: (snapshot: EyedropperSnapshotPayload) => void;
    setEyedropperErrorMessage: (message: string | null) => void;
    setEyedropperZoom: (zoom: number) => void;
    setEyedropperPreviewHex: (hex: string | null) => void;
    setEyedropperMousePosition: (position: Point) => void;
    setEyedropperResult: (result: HexColor | null) => void;
    setEyedropperOverlayViewportSize: (size: Size) => void;
}

@singleton()
export class EyedropperUiStore {
    private store = createStore<EyedropperUiStoreState>()(
        immer((set): EyedropperUiStoreState => ({
            state: initialEyedropperUiState,
            openEyedropper: (callbackAction: AppAction) => set((storeState: EyedropperUiStoreState) => {
                closeSnapshotBitmaps(storeState.state.snapshot);
                storeState.state = {
                    ...initialEyedropperUiState,
                    isOpen: true,
                    callbackAction: callbackAction,
                };
            }),
            closeEyedropper: () => set((storeState: EyedropperUiStoreState) => {
                storeState.state.isOpen = false;
            }),
            updateEyedropperSnapshot: (snapshot: EyedropperSnapshotPayload) => set((storeState: EyedropperUiStoreState) => {
                closeSnapshotBitmaps(storeState.state.snapshot);
                storeState.state.snapshot = snapshot;
            }),
            setEyedropperErrorMessage: (message: string | null) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.errorMessage = message;
            }),
            setEyedropperZoom: (zoom: number) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.zoom = zoom;
            }),
            setEyedropperPreviewHex: (hex: string | null) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.previewHex = hex;
            }),
            setEyedropperMousePosition: (position: Point) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.mousePosition = position;
            }),
            setEyedropperResult: (result: HexColor | null) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.result = result;
            }), 
            setEyedropperOverlayViewportSize: (size: Size) => set((storeState: EyedropperUiStoreState) => {
                storeState.state.overlayViewportSize = size;
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