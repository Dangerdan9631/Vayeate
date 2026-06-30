import { singleton } from 'tsyringe';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import type {
  EyedropperCommitTarget,
  EyedropperDisplaySnapshot,
  EyedropperPointerSample,
} from '../../../model/eyedropper';
import type { Size } from '../../../model/point';
import { initialEyedropperUiState, type EyedropperUiState } from './eyedropper-ui-state';

function createInitialEyedropperUiState(): EyedropperUiState {
  return {
    ...initialEyedropperUiState,
    overlayViewportSize: { ...initialEyedropperUiState.overlayViewportSize },
  };
}

function closeSnapshotBitmaps(snapshot: EyedropperDisplaySnapshot | null): void {
  if (!snapshot) return;
  for (const display of snapshot.displays) {
    display.bitmap.close();
  }
}

interface EyedropperUiStoreState {
  state: EyedropperUiState;
  openEyedropper: (commitTarget: EyedropperCommitTarget) => void;
  closeEyedropper: () => void;
  updateEyedropperSnapshot: (snapshot: EyedropperDisplaySnapshot) => void;
  setEyedropperErrorMessage: (message: string | null) => void;
  setEyedropperZoom: (zoom: number) => void;
  setEyedropperPointer: (pointer: EyedropperPointerSample) => void;
  setEyedropperOverlayViewportSize: (size: Size) => void;
}

/**
 * Zustand store for eyedropper overlay lifecycle, capture, and pointer state.
 */
@singleton()
export class EyedropperUiStore {
  private store = createStore<EyedropperUiStoreState>()(
    immer((set): EyedropperUiStoreState => ({
      state: createInitialEyedropperUiState(),
      openEyedropper: (commitTarget: EyedropperCommitTarget) =>
        set((storeState: EyedropperUiStoreState) => {
          closeSnapshotBitmaps(storeState.state.snapshot);
          storeState.state = {
            ...createInitialEyedropperUiState(),
            isOpen: true,
            commitTarget,
          };
        }),
      closeEyedropper: () =>
        set((storeState: EyedropperUiStoreState) => {
          closeSnapshotBitmaps(storeState.state.snapshot);
          storeState.state = createInitialEyedropperUiState();
        }),
      updateEyedropperSnapshot: (snapshot: EyedropperDisplaySnapshot) =>
        set((storeState: EyedropperUiStoreState) => {
          closeSnapshotBitmaps(storeState.state.snapshot);
          if (!storeState.state.isOpen) {
            closeSnapshotBitmaps(snapshot);
            return;
          }
          storeState.state.snapshot = snapshot;
        }),
      setEyedropperErrorMessage: (message: string | null) =>
        set((storeState: EyedropperUiStoreState) => {
          storeState.state.errorMessage = message;
        }),
      setEyedropperZoom: (zoom: number) =>
        set((storeState: EyedropperUiStoreState) => {
          storeState.state.zoom = zoom;
        }),
      setEyedropperPointer: (pointer: EyedropperPointerSample) =>
        set((storeState: EyedropperUiStoreState) => {
          storeState.state.pointer = pointer;
        }),
      setEyedropperOverlayViewportSize: (size: Size) =>
        set((storeState: EyedropperUiStoreState) => {
          storeState.state.overlayViewportSize = size;
        }),
    })),
  );

  /**
   * Zustand store API for React subscriptions via viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current snapshot and mutation methods for domain operations.
   * @returns Live eyedropper UI store state and setters.
   */
  getStore(): EyedropperUiStoreState {
    return this.store.getState();
  }
}
